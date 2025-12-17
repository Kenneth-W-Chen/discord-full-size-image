# discord-web-image-utilities
A userscript to provide some image utilities to Discord's website application

# Process
to-do: mermaid graph or something similar

1. wait for userPanelClass to appear
2. call foo -> start search for imageWrapperClass/imagePopUpLayerParentClass in appContainerSelector (mutationObserver/changeImageDimensions)
3. Find imageWrapperClass
  a. Watch imageWrapperClass for self removal?
   (1). Stop watching and remove dimensions?
  b. Fix image dimensions (removeDim)
  c. Watch carouselSelector
   (1) If div is added to childList, try removeDim
4. imagePopUpLayerParentClass is removed

# current layout
```html
<div class="carouselSelector">
  <div class="topbar">...</>
  <div previous button>...</>
  <span>Previous</>
  <div next button>...</>
  <span>Next</>
  <div class="gibberish-mediaArea">
    <div>
      <div imageWrapperClass style="height;width">
        <div loadingOverlay style="aspect-ratio">
          <img style="width;height"/>
        </div>
      </div>
    </div>
  </div>
  <div gallery Container>...</>
```
