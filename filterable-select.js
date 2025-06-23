/**
 * @module FlexibleTextField
 * @author Vanson Leung
 * @createdat 2025 06 23
 * @version 1.0.0
 * @github https://github.com/VansonLeung/filterable-select/
 */

window.FilterableSelectDOM = (() => {

  const __createElem = (html) => {
    const domContainer = document.createElement(`div`);
    domContainer.innerHTML = html;
    return domContainer.children[0];
  }

  const __replaceElem = (inputNode, replaceWithNode) => {
    inputNode.parentNode.replaceChild(replaceWithNode, inputNode);
  }

  const apply = (inputNode) => {

    const value = inputNode.value;
    const domOptions = inputNode.children;

    const options = Array.from(domOptions).map((it) => {
      return {
        value: it.value,
        label: it.innerHTML,
        textContent: it.textContent,
      };
    })

    const domSearchTextField = __createElem(`
      <input type="text" style="" />
    `);

    const domOverlay = __createElem(`
      <div style="position: absolute; left: 0; top: 100%; max-height: 80vh; display: flex; flex-direction: column; justify-content: flex-start;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      overflow-y: scroll;">
        <div style="position: sticky; top: 0px; background: #fff; padding: 10px;">
          <div data-holder-search-text-field style="
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 5px;
          ">
          </div>
        </div>
        <div data-holder-dropdown-list style="padding: 1px;"></div>
      </div>
    `);

    const domDropdownList = __createElem(`
      <div style="display: flex; flex-direction: column; justify-content: flex-start; ">
      </div>
    `);

    const domHolderSearchTextField = domOverlay.querySelector('[data-holder-search-text-field]');
    const domHolderDropdownList = domOverlay.querySelector('[data-holder-dropdown-list]');

    domHolderSearchTextField.append(domSearchTextField);
    domHolderDropdownList.append(domDropdownList);

    

    const domCustomSelect = __createElem(`
      <span data-custom-filterable-select
      style="
        user-select: none;
        position: relative;
        display: inline-block;
      ">
        <span data-custom-filterable-select-label
          style="
          padding: 5px;
          background: #fff;
          border-radius: 5px;
          border: 1px solid #333;
          text-align: left;
          width: 350px;
        ">
        label
        </span>

        <span data-holder-screen-mask
        style="position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: transparent; z-index: 9000000;">
        </span>

        <span data-holder-overlay
        style="position: absolute; left: 0; top: 100%; z-index: 10000000;">
        </span>

        <span data-holder-hidden-original-select style="display: none;"></span>
      </span>
    `);


    const domLabel = domCustomSelect.querySelector('[data-custom-filterable-select-label]');
    const domHolderScreenMask = domCustomSelect.querySelector('[data-holder-screen-mask]');
    const domHolderOverlay = domCustomSelect.querySelector('[data-holder-overlay]');
    const domHolderHiddenOriginalSelect = domCustomSelect.querySelector('[data-holder-hidden-original-select]');

    domHolderOverlay.style.display = `none`;
    domHolderScreenMask.style.display = domHolderOverlay.style.display;


    domHolderOverlay.append(domOverlay);




    domLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      doToggleOverlay();
      doRefreshList();
    })

    domHolderScreenMask.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      doHideOverlay();
    });

    domSearchTextField.addEventListener('input', (e) => {
      doRefreshList();
    })








    const doToggleOverlay = () => {
      domHolderOverlay.style.display = domHolderOverlay.style.display === `none` ? `` : `none`;
      domHolderScreenMask.style.display = domHolderOverlay.style.display;
    }

    const doHideOverlay = () => {
      domHolderOverlay.style.display = `none`;
      domHolderScreenMask.style.display = domHolderOverlay.style.display;
    }

    const doSelectItem = (opt, options = {}) => {
      const {
        shouldDispatchUpdate = false,
      } = options || {};

      domLabel.innerHTML = opt.label;

      if (domCustomSelect.value !== opt.value) {
        domCustomSelect.value = opt.value;
        inputNode.value = opt.value;

        if (shouldDispatchUpdate) {
          const event = new Event('change');
          inputNode.dispatchEvent(event);
        }
      }
    }



    const doRefreshList = () => {
      domDropdownList.innerHTML = ``;

      options.filter((opt) => {
        const keywords = domSearchTextField.value.split(" ").filter((it) => it);

        for (var k in keywords) {
          if (opt.textContent.indexOf(keywords[k]) == -1) {
            return false;
          }
        }

        return true;

      }).forEach((opt) => {

        const domItem = __createElem(`
          <div tabindex="0" style="padding: 5px 10px;">
            ${opt.label}
          </div>
        `);

        domItem.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          doSelectItem(opt, {
            shouldDispatchUpdate: true,
          });
          doHideOverlay();
        });

        domDropdownList.append(domItem);
      })
    }


    const doSyncValue = ({
      shouldDispatchUpdate,
    }) => {
      const selectedValue = inputNode.value;
      for (var k in options) {
        if (options[k].value === selectedValue) {
          doSelectItem(options[k], {
            shouldDispatchUpdate,
          });
        }
      }
    }









    doSyncValue({
      shouldDispatchUpdate: false,
    });

    inputNode.addEventListener('change', function () {
      doSyncValue({
        shouldDispatchUpdate: true,
      });
    });

    __replaceElem(inputNode, domCustomSelect);

    domHolderHiddenOriginalSelect.append(inputNode);

  }






  const _tryConvert = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.querySelectorAll) {
      node.querySelectorAll('input[data-filterable-select]:not([data-filterable-select-engaged=true])')
        .forEach(el => _tryConvert(el));
    }

    // If node itself matches, convert it
    if (node.tagName === 'SELECT' 
      && (node.hasAttribute('data-filterable-select') 
      && node.getAttribute('data-filterable-select-engaged') !== 'true')
    ) {
      node.setAttribute('data-filterable-select-engaged', 'true');
      apply(node);
    }
  };

  // MutationObserver with deep scan
  // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((addedNode) => {
          _tryConvert(addedNode);
        });
      }
    });
  });

  // Observe the document element for all subtree changes
  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });



  return {
    apply,
  }

})();

// FilterableSelectDOM.apply(document.querySelector('select#selectSchool'));
