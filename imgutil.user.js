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
// @version     0.1.4
// @author      Kenneth-W-Chen
// @description Force full image size load in preview pane on Discord
// ==/UserScript==

//function to remove the styles and get params that force a small dimension in discord's image preview
async function removeDim(imgWrapperNode)
{
   //remove width and height properties
      imgWrapperNode.style.removeProperty("width");
      imgWrapperNode.style.removeProperty("height");
      let imgNode = imgWrapperNode.childNodes[0];
      while(imgNode===null || imgNode.tagName !== 'IMG'){
        await new Promise((a)=>{setTimeout(a,500)})
        imgNode = imgWrapperNode.querySelector('img');
      }
      imgNode.style.removeProperty("width");
      imgNode.style.removeProperty("height");
      //set max size of image to viewport
      imgNode.style['max-width'] = '100vh';
      imgNode.style['max-height'] = '100vh';
      // change the source so it requests the full-size image
      let uS = imgNode.src.split('?')
      let p = new URLSearchParams(uS[1])
      p.delete('width')
      p.delete('height')
      imgNode.src = uS[0] + '?' + p.toString()
}

const config = { attributes: false, childList: true, subtree: false };
const configChild = {attributes:true,childList:true,subtree:false};

//callback that's run when the page loads the main content; adds mutationobserver to observe the chat container
const foo = ()=>
{
  // Check to see if the chat container was updated
  const searchNode = document.querySelector(".notAppAsidePanel__9d124 > .layerContainer_d5a653:nth-child(4)");
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
      wrapper = addedNode.querySelector('.imageWrapper_fd6587')
      if(wrapper === null) continue;
      //.notAppAsidePanel__9d124 > div:nth-child(4)
      // in theory, this should give the parent of the img
      // html structure below:
      //div.layer_ad604d > div.focusLock__10aa5 > div.modal_d2e7a7.root_a28985.fullscreenOnMobile__96797.rootWithShadow__073a7
        // > div.wrapper__8e1d7 > div.imageWrapper_fd6587.image__79a29
      mutationObserverThree.observe(wrapper,configChild);
      removeDim(wrapper);
      carouselWrapperObserver.observe(document.querySelector('.wrapper__8e1d7'),{childList:true})
      break;
    }
    for(removedNode of mutations.removedNodes)
      if(removedNode.className === 'layer_ad604d')
        {
          mutationObserverThree.disconnect();
        }
  }
}

const nodeRemoved = (mutationsList, observer)=>
{
  for(mutations of mutationsList)
    {
      console.log(mutations);
      if(mutations.target.classList.contains('imageWrapper_fd6587') && !(mutations.addedNodes === undefined || mutations.addedNodes.length==0))
      {
        observer.disconnect();
        removeDim(mutations.target);
      }
    }
}

let carouselWrapperObserver = new MutationObserver((e)=>{
  for(m of e){
    if(m.addedNodes.length > 0&& m.addedNodes[0].tagName==='DIV')
      {removeDim(m.addedNodes[0])
      break}
  }
})

let mutationObserver = new MutationObserver(changeImageDimensions)
let mutationObserverThree = new MutationObserver(nodeRemoved)
waitForKeyElements("div.layerContainer_d5a653", foo);
