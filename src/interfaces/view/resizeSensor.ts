/**
 * Taken and adapted from:
 * https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
 * Copyright Marc J. Schmidt. See the LICENSE (MIT)
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */

// TODO: remove the OOP stuff in favor to a data-function functional approach

export interface ExtHTMLElement extends HTMLElement {
  resizedAttached: EventQueue
  resizeSensor: HTMLElement
}

/* istanbul ignore next */
export class EventQueue {

  q: Array<EventListener>

  constructor() {
    this.q = []
  }

  add(ev) {
      this.q.push(ev)
  }

  call() {
    var i, j
    for (i = 0, j = this.q.length; i < j; i++) {
      this.q[i].call(this)
    }
  }

  remove(ev) {
    var newQueue = [], i, j
    for (i = 0, j = this.q.length; i < j; i++) {
      if (this.q[i] !== ev) newQueue.push(this.q[i])
    }
    this.q = newQueue
  }

  length() {
    return this.q.length
  }

}

/**
 * Class for dimension change detection.
 */
/* istanbul ignore next */
export class ResizeSensor {

  element: ExtHTMLElement
  callback: { (res: any): void }

  constructor (element: HTMLElement, callback: { (res: any): void }) {
    this.element = <ExtHTMLElement> element
    this.callback = callback
    this.attachResizeEvent(<ExtHTMLElement> element, callback)
  }

  attachResizeEvent (element: ExtHTMLElement, resized: { (res: any): void }) {
    if (element.resizedAttached) {
      element.resizedAttached.add(resized)
      return
    }

    element.resizedAttached = new EventQueue()
    element.resizedAttached.add(resized)

    element.resizeSensor = document.createElement('div')
    element.resizeSensor.className = 'resize-sensor'
    var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
    var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;'

    element.resizeSensor.style.cssText = style
    element.resizeSensor.innerHTML =
      '<div class="resize-sensor-expand" style="' + style + '">' +
        '<div style="' + styleChild + '"></div>' +
      '</div>' +
      '<div class="resize-sensor-shrink" style="' + style + '">' +
        '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
      '</div>'
    element.appendChild(element.resizeSensor)

    if (element.resizeSensor.offsetParent !== element) {
        element.style.position = 'relative'
    }

    var expand: HTMLElement = <any> element.resizeSensor.childNodes[0]
    var expandChild: HTMLElement = <any> expand.childNodes[0]
    var shrink: HTMLElement = <any> element.resizeSensor.childNodes[1]
    var dirty, rafId, newWidth, newHeight
    var lastWidth = element.offsetWidth
    var lastHeight = element.offsetHeight

    var reset = function () {
      expandChild.style.width = '100000px'
      expandChild.style.height = '100000px'

      expand.scrollLeft = 100000
      expand.scrollTop = 100000

      shrink.scrollLeft = 100000
      shrink.scrollTop = 100000
    }

    // setTimeout waits until rendering is done
    setTimeout(() => reset(), 0)

    var onResized = function () {
      rafId = 0

      if (!dirty) return

      lastWidth = newWidth
      lastHeight = newHeight

      if (element.resizedAttached) {
        element.resizedAttached.call()
      }
    }

    var onScroll = function () {
      newWidth = element.offsetWidth
      newHeight = element.offsetHeight
      dirty = newWidth != lastWidth || newHeight != lastHeight

      if (dirty && !rafId) {
        rafId = requestAnimationFrame(onResized)
      }

      reset()
    }

    var addEvent = function (el, name, cb) {
      if (el.attachEvent) {
        el.attachEvent('on' + name, cb)
      } else {
        el.addEventListener(name, cb)
      }
    }

    addEvent(expand, 'scroll', onScroll)
    addEvent(shrink, 'scroll', onScroll)
  }

  detach (ev) {
    let elem = this.element
    if(elem.resizedAttached && typeof ev == 'function') {
      elem.resizedAttached.remove(ev)
      if(elem.resizedAttached.length()) return
    }
    if (elem.resizeSensor) {
      if (elem.contains(elem.resizeSensor)) {
          elem.removeChild(elem.resizeSensor)
      }
      delete elem.resizeSensor
      delete elem.resizedAttached
    }
  }
}
