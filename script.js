// ==UserScript==
// @name        Discord Full Size Image
// @namespace   Discord_Scripts_K
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match       https://discord.com/channels/*
// @inject      into content
// @grant       none
// @version     1.0
// @author      -
// @description Force full image size load in preview pane on Discord
// ==/UserScript==
console.log("loaded")
const config = { attributes: false, childList: true, subtree: false };
const configAttr = {attributes: true, childList: false, subtree: false};
//this regex should remove all GET params
const imgRegex = /\?[a-z0-9=&]*$/gi;
// this regex should remove only the image dimension GET params
const imgRegexDim = /\&width=[0-9]+&height=[0-9]+/gi;

//callback that's run when the page loads the main content; adds mutationobserver to observe the chat container
const foo = ()=>
{
  // Check to see if the chat container was updated
  const searchNode = document.querySelector(".notAppAsidePanel__9d124 > .layerContainer_d5a653:nth-child(4)");
  mutationObserver.observe(searchNode, config);
}

const changeImageDimensions = (mutationsList, observer)=>
{
  console.log("Mutation")
  for(mutations of mutationsList)
  {
    console.log(mutations)
    if(mutations.type!=="childList")
      continue;
    for(addedNode of mutations.addedNodes)
    {
      console.log("Added nodes:")
      console.log(addedNode)
      if(addedNode.className !== "layer_ad604d")
        continue;
      console.log("Removing info")//.notAppAsidePanel__9d124 > div:nth-child(4)
      // in theory, this should give the parent of the img
      // html structure below:
      //div.layer_ad604d > div.focusLock__10aa5 > div.modal_d2e7a7.root_a28985.fullscreenOnMobile__96797.rootWithShadow__073a7
        // > div.wrapper__8e1d7 > div.imageWrapper_fd6587.image__79a29

      let imgWrapperNode = addedNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];

      //remove width and height properties
      imgWrapperNode.style.removeProperty("width");
      imgWrapperNode.style.removeProperty("height");
      let imgNode = imgWrapperNode.childNodes[0];
      console.log(imgNode)
      console.log(imgNode.style.width)
      imgNode.style.removeProperty("width");
      console.log(imgNode.style.width)
      imgNode.style.removeProperty("height");
      //set max size of image to viewport
      imgNode.style['max-width'] = '100vh';
      imgNode.style['max-height'] = '100vh';
      // change the source so it requests the full-size image
      console.log(imgNode.src)
      imgNode.src = imgNode.src.replace(imgRegex,'');
      console.log(imgNode.src)
      mutationObserverTwo.observe(imgNode, configAttr);
      break;
    }
    for(removedNode of mutations.removedNodes)
      if(removedNode.className === 'layer_ad604d')
        mutationObserverTwo.disconnect();
  }
}

const attrChange = (mutationsList, observer)=>
{
  console.log("Attr change")
  console.log(mutationsList)
}

let mutationObserver = new MutationObserver(changeImageDimensions)
let mutationObserverTwo = new MutationObserver(attrChange)
waitForKeyElements("div.layerContainer_d5a653", foo);
