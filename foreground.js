
// adds message button to users 
var el = document.getElementsByClassName("user-hover-card");
for (i=0; i<el.length; i++){
    el[i].addEventListener("mouseover", (event) => {
        setTimeout(()=>{
            var ele = event.target.querySelector('.user-info-card-header');
            var html = ele.innerHTML;
            if (!html.includes('</button>')) { // doesnt place multiple buttons
                ele.innerHTML = html + '<button class="dmBtn">Message</button>';
            };
        }, 100);
    });
}

console.log($('body'))