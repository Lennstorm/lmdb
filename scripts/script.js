'use strict';

// Global variabel som lagrar data
let movieData;

window.addEventListener('load', async() => {

    movieData = await fetchMovies();    
    searchMovies();
    setupCarousel();
    upDateTrailers();
    renderMovieGallery();
    clearSearch();
});

//Denna funktion skapar funktionalitet för karusellen
function setupCarousel() {
        const buttons = document.querySelectorAll('[data-carousel-btn]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const offset = btn.dataset.carouselBtn === 'next' ? 1 : -1;
            const slides = btn.closest('[data-carousel').querySelector('[data-slides');
            const activeSlide = slides.querySelector('[data-active]');
            let newIndex = [...slides.children].indexOf(activeSlide) + offset;
            
            if(newIndex < 0) {
                newIndex = slides.children.length - 1;
            } else if( newIndex >= slides.children.length) {
                newIndex = 0;
            }

            slides.children[newIndex].dataset.active = true;
            delete activeSlide.dataset.active;
        });
    });
}

async function fetchMovies() { // Function för att hämta data från Jespers API
 try {
    const response = await fetch('https://santosnr6.github.io/Data/movies.json');
    const movies = await response.json();
    
    return movies;
 } catch(error) {     
     return [];
    }
}

async function upDateTrailers() { // Slumpgenerator som tar fram fem random filmer och lägger dem i karusellen
    try {
        const randomMovies = [];
        const usedIndexes = new Set();
        
        while (randomMovies.length < 5) {
            const randomIndex = Math.floor(Math.random() * movieData.length);
            if (!usedIndexes.has(randomIndex)) {
                randomMovies.push(movieData[randomIndex]);
                usedIndexes.add(randomIndex);
            }
        }        
        console.log('* * * * * Slumpade filmer:');
        randomMovies.forEach(movie => {
            console.log('* *', movie.title);
        });
        const iframes = document.querySelectorAll('.carousel__slide iframe');
        iframes.forEach((iframe, index) => {
            iframe.src = randomMovies[index].trailer_link;
        })
        
    }   catch (error) {
        
    }
}

async function renderMovieGallery() { // Function för att rendera ut topp-filmerna i DOM
    try {
        const popularCardContainer = document.querySelector("#popularCardContainer");
        movieData.forEach(movie => {
            const movieCard = document.createElement("article")
            movieCard.classList.add("popular__card");
            
            const posterImg = document.createElement("img");
            posterImg.src = movie.poster;
            posterImg.alt = movie.title;
            posterImg.classList.add("popularCard-img");
            movieCard.appendChild(posterImg);

            const title = document.createElement("h3")
            title.textContent = movie.title;
            movieCard.appendChild(title);
            popularCardContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.log('c.log rad129 Nu blev det fel i renderingen, Göran!', error);
    }
}

async function searchMovies() {  //   Sökfunktion för filmer att skicka till API
    const searchFormRef = document.querySelector("form");
    const searchInputRef = document.querySelector("#searchInput");

    searchFormRef.addEventListener('submit', async (event) => {
        event.preventDefault();
            
        const searchTerm = searchInputRef.value.trim();
        if (searchTerm === '') {
            location.reload();
        } else {
            try {
                const searchResults = await fetchSearchResults(searchTerm);
                renderSearchResults(searchResults);
                // DÖLJA movieDetails
                const movieDetSect = document.querySelector('#details-wrapper');
                movieDetSect.classList.add('d-none');
                movieDetSect.classList.remove('d-flex');
            } catch (error) {
            console.log('Error i hämtingen, du!', error);
            }
        }
    });
};


async function fetchSearchResults(searchTerm) { // bred sökning i OMDB - startas av klick i funktionen searchMovies()
    const apiKey = '792523f7';
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.Response === 'True') {
        return data.Search;
    } else {
        throw new Error(data.Error);
    }
}

function renderSearchResults(results) { // rendera sökresultat från fetchSearchResults - startas av eventlyssnare i funktionen searchMovies()
    const trailerSectionRef = document.querySelector('#trailer-section');
    trailerSectionRef.classList.add('d-none');
    const popMoviesSection = document.querySelector('#popMovies');
    popMoviesSection.classList.add('d-none');    
    const searchResultsRef = document.querySelector('#searchResults');
    searchResultsRef.classList.remove('d-none');
    searchResultsRef.classList.add('d-flex');
    const resultsListRef = document.querySelector("#resultsList");
    while(resultsListRef.firstChild){
        resultsListRef.removeChild(resultsListRef.firstChild);
    }
    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.classList.add('result');
        listItem.dataset.id = result.imdbID;
        listItem.addEventListener('click', fetchMovieDetails)
        const image = document.createElement('img');
        image.src = result.Poster;
        listItem.appendChild(image);

        const title = document.createElement('span');
        title.textContent = result.Title;
        listItem.appendChild(title);

        resultsListRef.appendChild(listItem);
    });
        const movieDetailsRef = document.querySelector('#details-wrapper');
        movieDetailsRef.addEventListener('click', () => {
            movieDetailsRef.classList.add('d-none');
            movieDetailsRef.classList.remove('d-flex');
            const movieDetCard = document.querySelector('#movieDetails')
            movieDetCard .innerHTML = '';
            searchResultsRef.classList.remove('d-none');
            });
}

async function fetchMovieDetails(event) { //  funktion för att göra specifik sökning på IMDb-ID vid klick på film ur sökresultatet
    
    const imdbID = event.currentTarget.dataset.id;
    
    const searchResultsRef = document.querySelector('#searchResults');
    searchResultsRef.classList.remove('d-flex')
    searchResultsRef.classList.add('d-none')
    const movieDetSect = document.querySelector('#details-wrapper');
    movieDetSect.classList.add('d-flex');
    movieDetSect.classList.remove('d-none');
    const movieDetCard = document.querySelector('#movieDetails')
    const apiKey = '792523f7';
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&plot=full&i=${imdbID}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    
    const movieTitle = document.createElement('h2');
    movieTitle.textContent = data.Title
    movieTitle.classList.add('details__title');

    const moviePlot = document.createElement('p');
    moviePlot.textContent = data.Plot;
    moviePlot.classList.add('details__plot');

    const moviePoster = document.createElement('img');
    moviePoster.src = data.Poster;
    moviePoster.classList.add('details__poster');
    
    moviePoster.alt = data.Title;
    const movieGenre = document.createElement('p');
    movieGenre.textContent = `Genre: ${data.Genre}`;
    movieGenre.classList.add('details__genre');

    const movieEarnings = document.createElement('p');
    movieEarnings.textContent = `Box office net: ${data.BoxOffice}`;
    movieEarnings.classList.add('details__earnings');

    const movieDirector = document.createElement('p');
    movieDirector.textContent = `Directed by: ${data.Director}`;
    movieDirector.classList.add('details__director');
        
    movieDetCard .innerHTML = '';
    
    
    // Append children...
    movieDetCard.appendChild(movieTitle);
    movieDetCard.appendChild(movieDirector);
    movieDetCard.appendChild(moviePoster);
    movieDetCard.appendChild(movieGenre);
    movieDetCard.appendChild(moviePlot);
    movieDetCard.appendChild(movieEarnings);
      

    return data;
}

async function clearSearch() {
    const clearBtnRef = document.querySelector("#favBtn");
    const searchInputRef = document.querySelector("#searchInput");
    clearBtnRef.addEventListener('click', () => {
        searchInputRef.value = '';
    });
};