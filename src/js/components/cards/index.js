import Popup from "../popup";
import { randomString } from "../../utils/utils";

export default class Cards{
    constructor(){
        this.cardsBlock = document.getElementById('cardsBlock');
        this.cardsBodyInner = this.cardsBlock.querySelector('.cards_body_inner');
        this.cards = [];
        this.fillFlag = false;
        this.loadSavedCards();
        this.clearDeletedCards();
        this.fillCardsBlockToScroll = this.fillCardsBlockToScroll();
        this.handleClicks();
        this.handleScrolls();
        
    }

    loadSavedCards(){
        if(localStorage.getItem('cards')){
            this.cards = JSON.parse(localStorage.getItem('cards'));
            this.cards.forEach(item => this.createCard(item));
        };        
    }

    clearDeletedCards(){
        localStorage.setItem('deletedCards',JSON.stringify([]));
    }
    
    compareSizes(){
        let cardsArr = this.cardsBlock.querySelectorAll('.card');
        let cardsWidth = [...cardsArr].reduce((sum, item) => {
            return sum + item.offsetWidth;
        }, -16)
        let cardsBodyWidth = this.cardsBlock.querySelector('.cards_body').clientWidth;
    
        if(cardsBodyWidth > cardsWidth){
            this.cardsBodyInner.classList.remove('filled');
        } else {
            this.cardsBodyInner.classList.add('filled');
        }
    }

    handleScrolls(){   
        document.addEventListener('scroll', (e) => {
            if(!this.fillFlag) return;
            this.fillCardsBlockToScroll();
        })

        this.cardsBodyInner.addEventListener('scroll', (e) => {
            if(!this.fillFlag) return;
            this.fillCardsBlockToScroll();
        })
    }

    handleClicks(){
        this.cardsBlock.addEventListener('click', (e) => {
            if(!e.target.closest('.click_item')) return;
            let target = e.target.closest('.click_item');
            let action = target.getAttribute('action');
        
            if(action !== 'fill'){
                this.fillFlag = false;
                this.cardsBlock.querySelector('.cards_header_button-fill').classList.remove('button-stuck');
            }
        
            const actions = {
                add: this.addCard,
                remove: this.removeCard,
                fill: function(){
                    this.fillFlag = !this.fillFlag;
                    if(this.fillFlag) this.fillCardsBlock();
                    target.classList.toggle('button-stuck');
                },
                clear: function(){
                    this.cards.forEach(item => this.saveDeletedCard(item));
                    this.cards = [this.cards[0]];
        
                    this.cardsBlock.querySelectorAll('.card').forEach((item, i) => {
                        if(i) item.remove()
                    });
                    this.cardsBodyInner.classList.remove('filled');
        
                    this.saveCards();
                },
                reestablish: function(){
                    let id = target.getAttribute('id');
                    this.reestablishDeletedCard(target,id);
                },
                history: function(){
                    let deletedCards = JSON.parse(localStorage.getItem('deletedCards'));
                    let deletedCardsItems = [];
                    if(deletedCards.length){
                        deletedCards.forEach(item => {                    
                            let card = document.createElement('div');
                            card.classList = 'card-modal';
                            card.innerHTML = `
                                <div class="card-modal_title">${item.title}</div>
                                <div class="card-modal_button button click_item" action="reestablish" id="${item.id}">Восстановить</div>
                            `
                            deletedCardsItems.push(card);
                        })
        
                        new Popup({ childs: deletedCardsItems });
                    } else {                
                        let content = document.createElement('div');
                        content.classList = 'card-modal_content';
                        content.textContent = `Удаленных карточек нет`;
                        new Popup({ childs: [content] });
                    }
                },
                deleteThis: function(){
                    let card = target.closest('.card');
                    let id = +card.dataset.id;
                    card.remove();
        
                    this.cards = this.cards.filter(item => {
                        if(item.id !== id){
                            return true;  
                        } else {
                            this.saveDeletedCard(item);
                        }
                    }); 
        
                    this.saveCards();
                },
                openModal: function(){
                    let card = target.closest('.card');
                    let id = +card.dataset.id;
                    let modalText;
                    this.cards.forEach(item => {
                        if(item.id === id){
                            modalText = item.modalText;
                        }
                    })
        
                    let content = document.createElement('div');
                    content.classList = 'card-modal_content';
                    content.textContent = `Случайный контент: ${modalText}`;
                    new Popup({ childs: [content] });
                },
            };
        
            actions[action].call(this);
        });
    }
    
    fillCardsBlock(){
        let cardsArr = this.cardsBodyInner.querySelectorAll('.card');
        if(!cardsArr.length){
            this.addCard()
        }
        cardsArr = this.cardsBodyInner.querySelectorAll('.card');
        let lastCard = cardsArr[cardsArr.length - 1];
    
        if(document.documentElement.clientWidth > 768){
            if(lastCard.getBoundingClientRect().top < document.documentElement.clientHeight){
                this.addCard();
                this.fillCardsBlock();
            } else {
                this.removeCard(false);
            }
        } else {
            if(lastCard.getBoundingClientRect().left < document.documentElement.clientWidth){
                this.addCard();
                this.fillCardsBlock();
            }
        }
    }
    
    addCard(params = {}){
        let {id,title,text,modalText} = params;
        id = id ?? Date.now();
        title = title ?? randomString(Math.floor(Math.random() * 20) + 1);
        text = text ?? randomString(Math.floor(Math.random() * 20) + 1);
        modalText = modalText ?? randomString(Math.floor(Math.random() * 20) + 1);
        let obj = {
            id,
            title,
            text,
            modalText,
        };
    
        this.cards.push(obj);
        this.createCard(obj);
        this.saveCards();
    }
    
    createCard(params){
        let card = document.createElement('div');
        card.classList = 'card';
        card.dataset.id = params.id;
        card.innerHTML = `
            <div class="card_inner">
                <div class="card_close click_item" action="deleteThis"></div>
                <h3 class="card_title">${params.title}</h3>
                <p>${params.text}</p>
                <button class="button card_button click_item" action="openModal">Modal</button>
            </div>
        `
    
        this.cardsBodyInner.append(card); 
        this.compareSizes();
    }
    
    removeCard(saveFlag = true){
        let card = this.cards.pop();
        
        let cardsArr = this.cardsBlock.querySelectorAll('.card');
        cardsArr[cardsArr.length - 1].remove();
    
        this.saveCards();
        if(saveFlag) this.saveDeletedCard(card);
    }

    saveCards(){
        localStorage.setItem('cards',JSON.stringify(this.cards))
    }

    saveDeletedCard(card){
        let deletedCards = JSON.parse(localStorage.getItem('deletedCards'));
        deletedCards.push(card);
        localStorage.setItem('deletedCards',JSON.stringify(deletedCards));
    }

    fillCardsBlockToScroll(){
        let pageYOffset = 0;
        const isMobile = document.documentElement.clientWidth <= 768;
    
        return () => {
            if(isMobile){
                this.fillCardsBlock();            
            } else {
                if(window.pageYOffset > pageYOffset){
                    this.fillCardsBlock();
                    pageYOffset = window.pageYOffset; 
                }             
            }
        }    
    }

    reestablishDeletedCard(target,id){
        let card;
        let deletedCards = JSON.parse(localStorage.getItem('deletedCards'));
        let index = deletedCards.findIndex(item => item.id === id);
        card = deletedCards[index];
        deletedCards.splice(index,1);
        localStorage.setItem('deletedCards',JSON.stringify(deletedCards));
        addCard({...card});
        let popup = target.closest('.popup');
        target.closest('.card-modal').remove();
        if(!popup.querySelectorAll('.card-modal').length){
            this.removePopup(popup);
        }
    }
}