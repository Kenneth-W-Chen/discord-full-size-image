// ==UserScript==
// @name        Discord Full Size Image
// @namespace   Violentmonkey Scripts
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match       https://discord.com/channels/*
// @match       https://discord.com/login
// @downloadurl   https://github.com/Kenneth-W-Chen/discord-full-size-image/raw/main/imgutil.user.js
// @inject      into content
// @grant       none
// @version     0.1.17
// @author      Kenneth-W-Chen
// @description Force full image size load in preview pane on Discord
// ==/UserScript==
const debug = false;
const appContainerSelector = '.a3002d7de5be5280-notAppAsidePanel > ._59d0d7075b521375-layerContainer:nth-child(n+5)'
const imageWrapperClass = 'imageWrapper'
const videoWrapperClass = 'videoWrapper_aa8ea9' //only needed for carousels with videos
const carouselSelector = '.d3a6f0de39ff36e9-carouselModal'
const imagePopUpLayerParentClass = 'layer_bc663c' // removed when closing image/carousel
const userPanelClass = 'section[aria-label="User area"]' // the part of the UI with username, status, pfp, mute, deafen, and settings



//function to remove the styles and get params that force a small dimension in discord's image preview
async function removeDim(imgWrapperNode)
{
   //remove width and height properties
      if(imgWrapperNode.parentNode.classList.contains(videoWrapperClass)){
      if(debug) console.log('Not removing dimensions because it was a video');
        return
      }
      imgWrapperNode.style.removeProperty("width");
      imgWrapperNode.style.removeProperty("height");
      let imgNode = imgWrapperNode.childNodes[0];
      while(imgNode===null || imgNode.tagName !== 'IMG'){
        await new Promise((a)=>{setTimeout(a,500)})
        imgNode = imgWrapperNode.querySelector('img');
        if(imgWrapperNode===null)
          return;
      }
      if(debug) console.log('Removing dimensions from img')
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
      imgNodeMutationObserver.observe(imgNode,{
        attributes: true,
        attributeFilter: ['src']
      })
}

const config = { attributes: false, childList: true, subtree: false };
const configChild = {attributes:true,childList:true,subtree:false};

// starts the search process once the website fully loads
const foo = ()=>
{
  // Check to see if the chat container was updated
  const searchNode = document.querySelector(appContainerSelector);
  if(debug) {console.log('waiting for image node at ');console.log(searchNode)}
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
      if(debug) console.log(addedNode)
      wrapper = addedNode.querySelector('.'+imageWrapperClass)
      if(wrapper === null) {
        if(debug) console.log('Couldn\'t find image wrapper')
        continue
      }
      mutationObserverThree.observe(wrapper,configChild);
      removeDim(wrapper);
      carousel = document.querySelector(carouselSelector)
      if(carousel===null){
        if(debug) console.log('Didn\'t find a carousel to observe')
        continue;
      }
      carouselWrapperObserver.observe(carousel,{childList:true})
      break;
    }
    for(removedNode of mutations.removedNodes)
      if(removedNode.className === imagePopUpLayerParentClass) {
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

const imgDimensionsUpdated = (mutationsList, observer)=>{
  observer.disconnect()
  let imgNode = document.querySelector(appContainerSelector + ' > .' + imageWrapperClass + ' > img')
  let uS = imgNode.src.split('?')
  let p = new URLSearchParams(uS[1])
  if(p.has('width')){
    p.delete('width')
    p.delete('height')
    p.delete('format')
    imgNode.src = uS[0] + '?' + p.toString()
  }
  observer.observe(imgNode,{
    attributes: true,
    attributeFilter: ['src']
  })
}

let carouselWrapperObserver = new MutationObserver((e)=>{
  for(m of e){
    if(m.addedNodes.length > 0&& m.addedNodes[0].tagName==='DIV')
      {
        if(debug) console.log('remove',m.addedNodes[0])
        removeDim(m.addedNodes[0].querySelector('.'+imageWrapperClass))
      break}
  }
})

let mutationObserver = new MutationObserver(changeImageDimensions)
let mutationObserverThree = new MutationObserver(nodeRemoved)
var imgNodeMutationObserver = new MutationObserver(imgDimensionsUpdated)
waitForKeyElements(userPanelClass, foo);
