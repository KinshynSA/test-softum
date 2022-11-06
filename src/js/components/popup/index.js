export default class Popup{
    constructor({childs}){
        this.createPopup(childs);
        this.handleClicks();
    }

    handleClicks(){
        this.container.addEventListener('click', (e) => {
            if(!e.target.closest('.popup-click_item')) return;
            let target = e.target.closest('.popup-click_item');
            let action = target.getAttribute('action');
        
            const actions = {
                remove: function(){
                    this.removePopup(target);
                },
            };
        
            actions[action].call(this);
        })    
    }
    
    removePopup(target){
        this.container.remove();
        document.body.style.overflow = '';
    }
    
    createPopup(childs){
        this.container = document.createElement('div');
        this.container.classList = 'popup_container';
        this.container.innerHTML = `
            <div class="popup_background popup-click_item" action="remove"></div>
            <div class="popup_content">
                <div class="popup"></div>
            </div>
        `
    
        if(childs){
            let popup = this.container.querySelector('.popup');
            childs.forEach(item => popup.append(item));
        }
    
        document.body.style.overflow = 'hidden';
        document.body.append(this.container);
    }
}