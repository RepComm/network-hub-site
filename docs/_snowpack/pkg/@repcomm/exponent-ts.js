/**Get an element by its ID, alias
 */
/**An alias for getBoundingClientRect*/


const rect = e => e.getBoundingClientRect();
/**Alias for createElement*/


const make = type => document.createElement(type);
/**Listen to events on an element*/


const on = (elem, type, callback, options = undefined) => {
  if (!elem) throw "No element supplied";
  elem.addEventListener(type, callback, options);
};
/**Stop listen to events on an element*/


const off = (elem, type, callback) => {
  if (!elem) throw "No element supplied";
  elem.removeEventListener(type, callback);
};

const COMPONENT_NAMESPACE = "component-namespace";

/**Can be extended to create templates, or used for making
 * writting HTML less painful
 * 
 * @author Jonathan Crowder
 */
class Component {
  constructor() {
    this.eventListeners = new Array();
  }
  /**Mounts the component to a parent HTML element*/


  mount(parent) {
    if (parent instanceof HTMLElement) {
      parent.appendChild(this.element);
    } else if (parent instanceof Component) {
      // parent.mountChild(this);
      parent.element.appendChild(this.element);
    } else {
      throw "Cannot append to parent because its not a Component or HTMLElement";
    }

    return this;
  }

  unmount() {
    if (this.element.parentElement) {
      this.element.remove();
    }

    return this;
  }
  /**Mounts child component or html element to this*/


  mountChild(child) {
    if (child instanceof HTMLElement) {
      this.element.appendChild(child);
    } else if (child instanceof Component) {
      // this.element.appendChild(child.element);
      child.mount(this);
    } else {
      throw "Cannot append child because its not a Component or HTMLElement";
    }

    return this;
  }
  /**Listen to events on this componenet's element*/


  on(type, callback, options) {
    on(this.element, type, callback, options);
    this.eventListeners.push({
      type,
      callback
    });
    return this;
  }

  getRegisteredEvents(type, cb) {
    let result = new Array();

    for (let listener of this.eventListeners) {
      if (listener.type == type && listener.callback == cb) {
        result.push(listener);
      }
    }

    return result;
  }

  deleteRegisteredEvents(type, cb) {
    let listener;

    for (let i = 0; i < this.eventListeners.length; i++) {
      listener = this.eventListeners[i];

      if (type == listener.type && cb == listener.callback) {
        this.eventListeners.splice(i, 1);
      }
    }

    return this;
  }
  /**Stop listening to an event on this componenet's element*/


  off(type, callback) {
    off(this.element, type, callback);
    this.deleteRegisteredEvents(type, callback);
    return this;
  }

  setId(str) {
    this.element.id = str;
    return this;
  }

  getId() {
    return this.element.id;
  }
  /**Add CSS classes*/


  addClasses(...classnames) {
    this.element.classList.add(...classnames);
    return this;
  }
  /**Remove CSS classes*/


  removeClasses(...classnames) {
    this.element.classList.remove(...classnames);
    return this;
  }

  removeAllListeners() {
    for (let listener of this.eventListeners) {
      this.off(listener.type, listener.callback);
    }

    return this;
  }

  static assignComponentToNative(native, component) {
    native[COMPONENT_NAMESPACE] = {
      component: component
    };
  }

  static removeComponentFromNative(native) {
    native[COMPONENT_NAMESPACE] = undefined;
  }
  /**Make the element of this component a type of HTMLElement*/


  make(type) {
    if (this.element) {
      this.removeAllListeners();
      Component.removeComponentFromNative(this.element);
    }

    this.element = make(type);
    Component.assignComponentToNative(this.element, this);
    return this;
  }
  /**Use a native element instead of creating one*/


  useNative(element) {
    if (this.element) {
      this.removeAllListeners();
      Component.removeComponentFromNative(this.element);
    }

    if (!element) console.warn("useNative was passed", element);
    this.element = element;
    return this;
  }

  setTextContent(str) {
    this.element.textContent = str;
    return this;
  }

  getTextContent() {
    return this.element.textContent;
  }
  /**Alias of getBoundingClientRect */


  get rect() {
    return this.getRect();
  }

  getRect() {
    return rect(this.element);
  }
  /**Removes children components*/


  removeChildren() {
    while (this.element.lastChild) {
      this.element.lastChild.remove();
    }

    return this;
  }

  click() {
    this.element.click();
  }

  setStyleItem(item, value) {
    this.element.style[item] = value;
    return this;
  }

  getStyleItem(item) {
    return this.element.style[item];
  }
  /**Experimental*/


  for(start, count, cb) {
    for (let i = start; i < count + 1; i++) {
      cb(this, i);
    }

    return this;
  }
  /**Set attribute*/


  setAttr(name, value) {
    this.element[name] = value;
    return this;
  }

  getAttr(name) {
    return this.element[name];
  }

  removeAttr(name) {
    this.element.removeAttribute(name);
    return this;
  }

  static nativeIsComponent(element) {
    return element[COMPONENT_NAMESPACE] != undefined && element[COMPONENT_NAMESPACE] != null;
  }

  static nativeToComponent(element) {
    if (!Component.nativeIsComponent(element)) throw `No component found in native ${element}`;
    return element[COMPONENT_NAMESPACE].component;
  }

}

/**Base component for exponent library
 * 
 */

class Exponent extends Component {
  /**Doesn't have to be used by class extensions*/
  constructor() {
    super();
    this.mutObserver = new MutationObserver(this.onElementMutate);
    this.enabled = true;
  }

  getEnabled() {
    return this.enabled;
  }

  setEnabled(enable) {
    if (this.getEnabled() == enable) return this;
    this.enabled = enable;
    this.onEnable();
  }

  onEnable() {}

  make(type) {
    super.make(type);
    this.notifyElementChanged();
    this.applyRootClasses();
    return this;
  }
  /**Called by mutation observer
   * @param recs
   * @param observer 
   */


  onElementMutate(recs, observer) {
    for (let rec of recs) {
      if (rec.type !== "childList") continue; // rec.addedNodes
      // rec.removedNodes
    }
  }
  /**Let the Exponent know if its native element has been changed
   * Typically fired when element removed or added to handle mutation observation of dom node
   */


  notifyElementChanged() {
    this.mutObserver.disconnect();

    if (this.element) {
      this.mutObserver.observe(this.element, {
        subtree: false,
        //Don't listen to grandchildren/etc
        childList: true //Do listen to child remove/add

      });
    }

    return this;
  }

  applyRootClasses() {
    this.addClasses("exponent");
    return this;
  }

}

class Panel extends Exponent {
  constructor() {
    super();
    this.make("div");
    this.addClasses("exponent-panel");
  }

}

class Button extends Exponent {
  /**TODO - This should probably be abstracted*/
  constructor() {
    super();
    this.setUseType("normal");
    this.make("button");
    this.addClasses("exponent-dark", "exponent-button");
  }

  setUseType(type) {
    this.useType = type;
    return this;
  }

}

const EXPONENT_CSS_STYLES = new Component().make("style").setId("exponent-built-in-styles").setTextContent(`
  .exponent {
    flex: 1;
  }
  .exponent-panel {
    display: flex;
  }
  .exponent-dual-panel {
    display: flex;
  }
  .exponent-grid {
    display: grid;
  }
  .exponent-button {
    border: none;
    cursor: pointer;
  }
  .exponent-knob-grab {
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: contain;
    cursor: grab;
  }
  .exponent-drawing {
    min-width:0;
  }
  .exponent-square-container {
  }
  .exponent-list {
    flex-wrap: wrap;
    /* overflow:hidden; */
  }
  .exponent-list>* {
    flex: 1;
  }`);

export { Button, EXPONENT_CSS_STYLES, Exponent, Panel };
