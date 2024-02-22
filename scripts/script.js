'use strict';

window.addEventListener('load', () => {
    console.log('c.log load');
    //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
    processMovies(); 
    fetchDataAndStore();
    setupCarousel();
    upDateTrailers();
});

//Denna funktion skapar funktionalitet för karusellen
function setupCarousel() {
    console.log('c.log carousel');
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

// Function för att hämta data från Jespers API

async function fetchMovies() {
 try {
    const response = await fetch('https://santosnr6.github.io/Data/movies.json');
    const movies = await response.json();
    console.log('c.log success fetching movies!');
    return movies;
 } catch(error) {
     console.log('c.log  error fetching data', error);
     return [];
    }
}

async function processMovies() {
    try {
        const movieData = await fetchMovies();
        console.log('c.log Filmdata', movieData)

    } catch (error) {
        console.log('c.log Error processing data', error);
    }
}


// Global variabel som lagrar data
let movieData;

async function fetchDataAndStore() {
    try {
        movieData = await fetchMovies();
        console.log('c.log Fetched movie däta', movieData);        
    } catch (error){
        console.error('ärror fetching däta', error)
    }
}

// Slumpgenerator som tar fram fem random filmer och lägger dem i karusellen

async function upDateTrailers() {
    try {
        const movies = await fetchMovies();
        const randomMovies = [];
        const usedIndexes = new Set();
        
        while (randomMovies.length < 5) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            if (!usedIndexes.has(randomIndex)) {
                randomMovies.push(movies[randomIndex]);
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

        console.log('c.log random filmer har lagts till i DOM');
    }   catch (error) {
        console.log('c.log din jävla klant du har kodat fel!', error);
    }
}