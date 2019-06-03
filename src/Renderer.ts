// @flow

import ReactReconciler from 'react-reconciler';
import {
  unstable_now as now,
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from 'scheduler';

import { Group, Item, Layer, Path, PointText, Raster, Tool } from 'paper';

import { Type } from './types';

import { arePointsEqual } from './utils';

import { invariant } from './invariant';

function applyItemProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  if (props.blendMode !== prevProps.blendMode) {
    instance.blendMode = props.blendMode;
  }
  if (props.clipMask !== prevProps.clipMask) {
    instance.clipMask = props.clipMask;
  }
  if (props.opacity !== prevProps.opacity) {
    instance.opacity = props.opacity;
  }
  if (props.rotation !== prevProps.rotation) {
    instance.rotation = props.rotation;
  }
  if (props.selected !== prevProps.selected) {
    instance.selected = props.selected;
  }
  if (props.visible !== prevProps.visible) {
    instance.visible = props.visible;
  }
}

function applyStyleProps(instance: any, props: any) {
  if (props.fillColor) {
    instance.fillColor = props.fillColor;
  }
  if (props.strokeColor) {
    instance.strokeColor = props.strokeColor;
  }
  if (props.selected) {
    instance.selected = props.selected;
  }
}

function applyGroupProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyItemProps(instance, props, prevProps);
  if (!arePointsEqual(props.center, prevProps.center)) {
    instance.translate([
      props.center[0] - prevProps.center[0],
      props.center[1] - prevProps.center[1],
    ]);
  }
  if (!arePointsEqual(props.pivot, prevProps.pivot)) {
    instance.pivot = props.pivot;
  }
  if (!arePointsEqual(props.position, prevProps.position)) {
    instance.position = props.position;
  }
  if (props.rotation !== prevProps.rotation) {
    // in case null is set
    const rotation = props.rotation ? props.rotation : 0;
    const prevRotation = prevProps.rotation ? prevProps.rotation : 0;
    instance.rotate(rotation - prevRotation);
  }
  // TODO: check if this is ok
  if (props.strokeColor !== prevProps.strokeColor) {
    instance.strokeColor = props.strokeColor;
  }
  if (props.fillColor !== prevProps.fillColor) {
    instance.fillColor = props.fillColor;
  }
}

function applyLayerProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyItemProps(instance, props, prevProps);
  if (props.active !== prevProps.active && props.active === true) {
    instance.activate();
  }
  if (props.locked !== prevProps.locked) {
    instance.locked = props.locked;
  }
  // TODO: check if this is ok
  if (props.strokeColor !== prevProps.strokeColor) {
    instance.strokeColor = props.strokeColor;
    instance.children.forEach((child: any) => {
      if (child instanceof Path) {
        child.strokeColor = props.strokeColor;
      }
    });
  }
  if (props.fillColor !== prevProps.fillColor) {
    instance.fillColor = props.fillColor;
  }
}

function applyPathProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyItemProps(instance, props, prevProps);
  if (!arePointsEqual(props.center, prevProps.center)) {
    instance.translate([
      props.center[0] - prevProps.center[0],
      props.center[1] - prevProps.center[1],
    ]);
  }
  if (!arePointsEqual(props.pivot, prevProps.pivot)) {
    instance.pivot = props.pivot;
    instance.position = props.position;
  }
  if (!arePointsEqual(props.position, prevProps.position)) {
    instance.position = props.position;
  }
  if (props.closed !== prevProps.closed) {
    instance.closed = props.closed;
  }
  if (props.dashArray !== prevProps.dashArray) {
    instance.dashArray = props.dashArray;
  }
  if (props.dashOffset !== prevProps.dashOffset) {
    instance.dashOffset = props.dashOffset;
  }
  if (props.fillColor !== prevProps.fillColor) {
    instance.fillColor = props.fillColor;
  }
  if (props.pathData !== prevProps.pathData) {
    instance.pathData = props.pathData;
  }
  if (!arePointsEqual(props.point, prevProps.point)) {
    instance.translate([props.point[0] - prevProps.point[0], props.point[1] - prevProps.point[1]]);
  }
  if (props.rotation !== prevProps.rotation) {
    // in case null is set
    const rotation = props.rotation ? props.rotation : 0;
    const prevRotation = prevProps.rotation ? prevProps.rotation : 0;
    instance.rotate(rotation - prevRotation);
  }
  if (props.strokeCap !== prevProps.strokeCap) {
    instance.strokeCap = props.strokeCap;
  }
  if (props.strokeColor !== prevProps.strokeColor) {
    instance.strokeColor = props.strokeColor;
  }
  if (props.strokeJoin !== prevProps.strokeJoin) {
    instance.strokeJoin = props.strokeJoin;
  }
  if (props.strokeScaling !== prevProps.strokeScaling) {
    instance.strokeScaling = props.strokeScaling;
  }
  if (props.strokeWidth !== prevProps.strokeWidth) {
    instance.strokeWidth = props.strokeWidth;
  }
}

function applyRectangleProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyPathProps(instance, props, prevProps);
  if (!arePointsEqual(props.size, prevProps.size)) {
    instance.scale(props.size[0] / prevProps.size[0], props.size[1] / prevProps.size[1]);
  }
}

function applyCircleProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyPathProps(instance, props, prevProps);
  if (props.radius !== prevProps.radius) {
    instance.scale(props.radius / prevProps.radius);
  }
}

function applyEllipseProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyRectangleProps(instance, props, prevProps);
}

function applyArcProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyPathProps(instance, props, prevProps);
  if (!arePointsEqual(props.from, prevProps.from)) {
    instance.from = props.from;
  }
  if (!arePointsEqual(props.to, prevProps.to)) {
    instance.to = props.to;
  }
  if (!arePointsEqual(props.through, prevProps.through)) {
    instance.through = props.through;
  }
}

function applyRasterProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyItemProps(instance, props, prevProps);
  if (props.source !== prevProps.source) {
    instance.source = props.source;
  }
  if (props.onLoad !== prevProps.onLoad) {
    instance.onLoad = props.onLoad;
  }
}

function applyPointTextProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  applyItemProps(instance, props, prevProps);
  if (props.content !== prevProps.content) {
    instance.content = props.content;
  }
  if (props.fillColor !== prevProps.fillColor) {
    instance.fillColor = props.fillColor;
  }
  if (props.fontFamily !== prevProps.fontFamily) {
    instance.fontFamily = props.fontFamily;
  }
  if (props.fontSize !== prevProps.fontSize) {
    instance.fontSize = props.fontSize;
  }
  if (props.fontWeight !== prevProps.fontWeight) {
    instance.fontWeight = props.fontWeight;
  }
  if (!arePointsEqual(props.point, prevProps.point)) {
    instance.translate([props.point[0] - prevProps.point[0], props.point[1] - prevProps.point[1]]);
  }
}

function applyToolProps(instance: any, props: any, prevProps?: any) {
  if (!prevProps) {
    prevProps = {};
  }

  if (props.active !== prevProps.active && props.active === true) {
    instance.activate();
  }
  if (props.onMouseDown !== prevProps.onMouseDown) {
    instance.onMouseDown = props.onMouseDown;
  }
  if (props.onMouseDrag !== prevProps.onMouseDrag) {
    instance.onMouseDrag = props.onMouseDrag;
  }
  if (props.onMouseMove !== prevProps.onMouseMove) {
    instance.onMouseMove = props.onMouseMove;
  }
  if (props.onMouseUp !== prevProps.onMouseUp) {
    instance.onMouseUp = props.onMouseUp;
  }
  if (props.onKeyUp !== prevProps.onKeyUp) {
    instance.onKeyUp = props.onKeyUp;
  }
  if (props.onKeyDown !== prevProps.onKeyDown) {
    instance.onKeyDown = props.onKeyDown;
  }
}

export const Renderer = ReactReconciler({
  appendInitialChild(parentInstance, child) {
    if (typeof child === 'string') {
      // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
      invariant(false, 'Text children should already be flattened.');
    } else if (parentInstance instanceof Group && child instanceof Item) {
      child.addTo(parentInstance);
    }
  },

  createInstance(type: Type, props: any, paperScope) {
    const { children, ...paperProps } = props;
    let instance: any;

    switch (type) {
      case 'Tool':
        instance = new (Tool as any)(paperProps);
        instance._applyProps = applyToolProps;
        break;
      case 'Circle':
        instance = new Path.Circle(paperProps);
        instance._applyProps = applyCircleProps;
        break;
      case 'Ellipse':
        instance = new Path.Ellipse(paperProps);
        instance._applyProps = applyEllipseProps;
        break;
      case 'Group':
        instance = new Group(paperProps);
        instance._applyProps = applyGroupProps;
        break;
      case 'Layer':
        instance = new Layer(paperProps);
        instance._applyProps = applyLayerProps;
        break;
      case 'Line':
        instance = new Path.Line(paperProps);
        instance._applyProps = applyPathProps;
        break;
      case 'Path':
        instance = new Path(paperProps);
        instance._applyProps = applyPathProps;
        break;
      case 'PointText':
        instance = new PointText(paperProps);
        instance._applyProps = applyPointTextProps;
        break;
      case 'Rectangle':
        instance = new Path.Rectangle(paperProps);
        instance._applyProps = applyRectangleProps;
        break;
      case 'Arc':
        instance = new Path.Arc(paperProps);
        instance._applyProps = applyArcProps;
        break;
      case 'Raster': {
        const { onLoad, ...rasterProps } = paperProps;
        instance = new Raster(rasterProps);
        instance._applyProps = applyRasterProps;
        if (typeof onLoad === 'function') {
          instance.onLoad = () => onLoad(instance);
        }
        break;
      }
      default:
        invariant(instance, 'PaperRenderer does not support the type "%s"', type);
        break;
    }

    // apply data type
    if (!instance.data) {
      instance.data = { type };
    } else if (!instance.data.type) {
      instance.data.type = type;
    }

    invariant(instance, 'PaperRenderer does not support the type "%s"', type);

    return instance;
  },

  createTextInstance(text, rootContainerInstance, paperScope) {
    return text;
  },

  finalizeInitialChildren(domElement: Item, type: Type, props: any) {
    // If applyMatrix=true, group props should be applied after all children have benn added.
    // If applyMatrix=false, only style-related props (ex. fillColor, strokeColor) should be applied.
    // TODO: add case for Layer
    switch (type) {
      case 'Group':
        if (domElement.applyMatrix) {
          applyGroupProps(domElement, props);
        } else {
          applyStyleProps(domElement, props);
        }
        break;
      default:
        break;
    }
    return false;
  },

  getPublicInstance(instance) {
    return instance;
  },

  prepareForCommit() {
    // Noop
  },

  prepareUpdate(domElement, type, oldProps, newProps) {
    return true;
  },

  resetAfterCommit() {
    // Noop
  },

  resetTextContent(domElement) {
    // Noop
  },

  shouldDeprioritizeSubtree(type, props) {
    return false;
  },

  getRootHostContext() {
    return {};
  },

  getChildHostContext() {
    return {};
  },

  isPrimaryRenderer: false,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  //useSyncScheduling: true,

  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  noTimeout: -1,

  now,
  scheduleDeferredCallback,
  cancelDeferredCallback,

  shouldSetTextContent(type, props) {
    return typeof props.children === 'string' || typeof props.children === 'number';
  },

  appendChild(parentInstance: any, child: any) {
    if (child.parentNode === parentInstance) {
      child.remove();
    }
    if (parentInstance instanceof Group && child instanceof Item) {
      child.addTo(parentInstance);
    }
  },

  appendChildToContainer(parentInstance: any, child: any) {
    if (child.parentNode === parentInstance) {
      child.remove();
    }
    if (parentInstance instanceof Group && child instanceof Item) {
      child.addTo(parentInstance);
    }
  },

  insertBefore(parentInstance: any, child: any, beforeChild: any) {
    invariant(child !== beforeChild, 'PaperRenderer: Can not insert node before itself');
    if (parentInstance instanceof Group && child instanceof Path && beforeChild instanceof Path) {
      child.insertAbove(beforeChild);
    }
  },

  insertInContainerBefore(parentInstance: any, child: any, beforeChild: any) {
    invariant(child !== beforeChild, 'PaperRenderer: Can not insert node before itself');
    if (parentInstance instanceof Group && child instanceof Path && beforeChild instanceof Path) {
      child.insertAbove(beforeChild);
    }
  },

  removeChild(parentInstance, child: any) {
    child.remove();
  },

  removeChildFromContainer(parentInstance, child: any) {
    child.remove();
  },

  commitTextUpdate(textInstance, oldText, newText) {
    // Noop
  },

  commitMount(instance, type, newProps) {
    // Noop
  },

  commitUpdate(instance: any, updatePayload, type, oldProps, newProps, paperScope) {
    instance._applyProps(instance, newProps, oldProps);
  },
});
