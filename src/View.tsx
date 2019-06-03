// @flow

import * as React from 'react';

import { PaperScope, Size } from 'paper';

import { List, Map, Set } from 'immutable';

import { Fiber, FiberRoot } from 'react-reconciler';

import { Renderer } from './Renderer';

export function defined<T>(object: T | undefined): T {
  if (object === undefined) {
	  throw new Error('expected non-undefined object');
  }
  return object;
}

export function exists<T>(object: T | null): T {
    if (object === null) {
	throw new Error('expected non-null object');
    }
    return object;
}

interface ViewProps {
    children?: React.ReactNode;
    width: number;
    height: number;
    settings?: any;
}

export class View extends React.Component<ViewProps> {
    canvas: React.RefObject<HTMLCanvasElement> | null | undefined;
    scope: PaperScope;
    mountNode: FiberRoot;

    constructor(props: ViewProps) {
	super(props);
	this.canvas = React.createRef();
    }

    componentDidMount() {
	const { children, width, height, settings } = this.props;

	if (!this.canvas || !this.canvas.current) {
	    throw new Error('expected non-null canvas on componentDidMount');
	}

	this.scope = new PaperScope()
	this.scope.setup(this.canvas.current);

	if (settings) {
	    for (const key of Object.keys(settings)) {
		// FIXME
		(this.scope.settings as any)[key] = settings[key]
	    }
	}

	    this.scope.view.viewSize = new Size(width, height)

	    this.mountNode = Renderer.createContainer(this.scope, false, false)

	    Renderer.updateContainer(children, this.mountNode, this, undefined as unknown as (() => void | null | undefined));
    }

  componentDidUpdate(prevProps: ViewProps) {
	  const { children, width, height } = this.props;
	  const { view } = this.scope;

	  Renderer.updateContainer(children, this.mountNode, this, undefined as unknown as (() => void | null | undefined));

	  if (width !== prevProps.width || height !== prevProps.height) {
	    const prevCenter = view.center
	    view.viewSize = new Size(width, height)
	    view.translate(view.center.subtract(prevCenter))
	  }
  }

  componentWillUnmount() {
	  Renderer.updateContainer(null, this.mountNode, this, undefined as unknown as (() => void | null | undefined))
    }

    render() {
	const { children, width, height, ...other } = this.props;
	return (<canvas {...other} ref={this.canvas} />);
    }
}

Renderer.injectIntoDevTools({
  findFiberByHostInstance: (instance: unknown): Fiber => {
    return null as unknown as Fiber;
  },
    bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
    rendererPackageName: 'react-paper-bindings',
    version: '2.0.0',
})
