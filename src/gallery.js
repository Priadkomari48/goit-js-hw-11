import Notiflix from "notiflix";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/fetchImg';

const refs = {
    form: document.querySelector('#search-form'),
    galleryMarkupEl: document.querySelector('div.gallery'),
    formInputEl: document.querySelector('input'),
    submitFormBtnEl: document.querySelector('.form-btn'),
    loadMoreBtnEl: document.querySelector('.load-more'),
}


let page = 2;
let limit = 40;
const totalPages = 500 / limit;


Notiflix.Notify.init({
  position: 'right-top',
  width: '400px',
  fontSize: '20px',
});

const lightbox = new SimpleLightbox('.gallery a', { captionsData: `alt`, captionDelay: 250 });

refs.form.addEventListener('submit', pictureRequest);
refs.loadMoreBtnEl.addEventListener('click', loadMoreImgs);
let name = '';



function pictureRequest(e) {
    e.preventDefault();
    const {
        elements: { searchQuery }
    } = e.currentTarget;
    
    name = searchQuery.value.toLowerCase().trim();
    console.log(name);
    clearInput();

    if (name === '') {
        refs.loadMoreBtnEl.classList.add('is-hidden');
        Notiflix.Notify.warning('Please enter request.');
        return
    }
    onImagesFetch(name);

    function onImagesFetch(name) {
        fetchImages(name)
            .then(pictures => {
                console.log(pictures);
                if (pictures.total === 0) {
                    refs.loadMoreBtnEl.classList.add('is-hidden');
                    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
                    return;
                }
                refs.loadMoreBtnEl.classList.remove('is-hidden');
                addMarkupItems(pictures.hits);
            })
            .catch(error => console.log(error));
    }
    e.currentTarget.reset();
};

function loadMoreImgs() {  
    const params = new URLSearchParams({
     page: page,
     per_page: limit,
    });

    const url = `https://pixabay.com/api/?key=25798215-b5224b890c985f6c53280bcb2&q=${name}&${params}&image_type=photo&orientation=horizontal&safesearch=true`;

     if (page > totalPages) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }
    return fetch(url)
        .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
        })
        .then(pictures => {
            addMarkupItems(pictures.hits);
             page += 1;
        });
}

function addMarkupItems(images) {
    images.map(img => {
            const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = img;
            return refs.galleryMarkupEl.insertAdjacentHTML('beforeend',
                `<div class="photo-card">
                        <a class="img-link" href="${largeImageURL}">
                            <img class = "gallery-image" src="${webformatURL}" data-source=${largeImageURL} alt="${tags}" loading="lazy" />
                        </a>
                        <div class="info">
                            <p class="info-item">
                                <b>Likes</b> ${likes}
                            </p>
                            <p class="info-item">
                                <b>Views</b> ${views}
                            </p>
                            <p class="info-item">
                                <b>Comments</b> ${comments}
                            </p>
                            <p class="info-item">
                                <b>Downloads</b> ${downloads}
                            </p>
                        </div>
                    </div>
                </div>   
                `)
        })
        .join('');
    lightbox.refresh();
};


function clearInput() {
  refs.galleryMarkupEl.innerHTML = '';
}