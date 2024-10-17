// ==UserScript==
// @name        Discord Full Size Image
// @namespace   Violentmonkey Scripts
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match       https://discord.com/channels/*
// @match       https://discord.com/login
// @downloadurl   https://github.com/Kenneth-W-Chen/discord-web-image-utilities/raw/main/imgutil.user.js
// @inject      into content
// @grant       none
// @version     0.1.11
// @author      Kenneth-W-Chen
// @description Force full image size load in preview pane on Discord
// ==/UserScript==

const appContainerSelector = '.notAppAsidePanel_bd26cc > .layerContainer_cd0de5'
const imageWrapperClass = 'imageWrapper_d4597d'
const videoWrapperClass = 'videoWrapper_aa8ea9'
const carouselSelector = '.wrapper_fb6520'
const imagePopUpLayerParentClass = 'layer_c9e2da' // div that gets removed when closing the image/video pop-up
const userPanelClass = 'div.container_b2ca13' // the part of the UI with username, status, pfp, mute, deafen, and settings

//function to remove the styles and get params that force a small dimension in discord's image preview
async function removeDim(imgWrapperNode)
{
   //remove width and height properties
      if(imgWrapperNode.parentNode.classList.contains(videoWrapperClass))
        return
      imgWrapperNode.style.removeProperty("width");
      imgWrapperNode.style.removeProperty("height");
      let imgNode = imgWrapperNode.childNodes[0];
      while(imgNode===null || imgNode.tagName !== 'IMG'){
        await new Promise((a)=>{setTimeout(a,500)})
        imgNode = imgWrapperNode.querySelector('img');
        if(imgWrapperNode===null)
          return;
      }
      imgNode.style.removeProperty("width");
      imgNode.style.removeProperty("height");
      //set max size of image to viewport
      imgNode.style['max-width'] = '100vh';
      imgNode.style['max-height'] = '100vh';
  imgNode.style['position'] = 'static';
      // change the source so it requests the full-size image
      let uS = imgNode.src.split('?')
      let p = new URLSearchParams(uS[1])
      p.delete('width')
      p.delete('height')
      p.delete('format')
      imgNode.src = uS[0] + '?' + p.toString()
      imgNode.onload = ()=>{imgNode.parentNode.style['width']=imgNode.naturalWidth;imgNode.parentNode.style['height']=imgNode.naturalHeight;}
}

const config = { attributes: false, childList: true, subtree: false };
const configChild = {attributes:true,childList:true,subtree:false};

//callback that's run when the page loads the main content; adds mutationobserver to observe the chat container
const foo = ()=>
{
  // Check to see if the chat container was updated
  const searchNode = document.querySelector(appContainerSelector);
  mutationObserver.observe(searchNode, config);
}

const changeImageDimensions = (mutationsList, observer)=>
{
  for(mutations of mutationsList)
  {
    if(mutations.type!=="childList")
      continue;
    for(addedNode of mutations.addedNodes)
    {
      console.log(addedNode)
      wrapper = addedNode.querySelector('.'+imageWrapperClass)
      if(wrapper === null) continue;
      mutationObserverThree.observe(wrapper,configChild);
      removeDim(wrapper);
      carousel = document.querySelector(carouselSelector)
      if(carousel===null)continue;
      carouselWrapperObserver.observe(carousel,{childList:true})
      break;
    }
    for(removedNode of mutations.removedNodes)
      if(removedNode.className === imagePopUpLayerParentClass)
        {
          mutationObserverThree.disconnect();
        }
  }
}

const nodeRemoved = (mutationsList, observer)=>
{
  for(mutations of mutationsList)
    {
      if(mutations.target.classList.contains('imageWrapperClass') && !(mutations.addedNodes === undefined || mutations.addedNodes.length==0))
      {
        observer.disconnect();
        removeDim(mutations.target);
      }
    }
}

let carouselWrapperObserver = new MutationObserver((e)=>{
  for(m of e){
    if(m.addedNodes.length > 0&& m.addedNodes[0].tagName==='DIV')
      {
        console.log('remove',m.addedNodes[0])
        removeDim(m.addedNodes[0])
      break}
  }
})

let mutationObserver = new MutationObserver(changeImageDimensions)
let mutationObserverThree = new MutationObserver(nodeRemoved)
waitForKeyElements(userPanelClass, foo);
