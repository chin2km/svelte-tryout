
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    var Add = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0V0zm0 0h24v24H0V0z\" fill=\"none\"/><path d=\"M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>";

    var Inactive = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>";

    var Close = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>";

    /* src/components/ToDoItem.svelte generated by Svelte v3.20.1 */
    const file = "src/components/ToDoItem.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let raw0_value = (/*todo*/ ctx[0].completed ? Add : Inactive) + "";
    	let t0;
    	let div1;
    	let t1_value = /*todo*/ ctx[0].text + "";
    	let t1;
    	let t2;
    	let div2;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "icon svelte-5jd29i");
    			add_location(div0, file, 60, 2, 1111);
    			attr_dev(div1, "class", "text svelte-5jd29i");
    			add_location(div1, file, 63, 2, 1188);
    			attr_dev(div2, "class", "icon svelte-5jd29i");
    			add_location(div2, file, 64, 2, 1226);
    			attr_dev(div3, "class", div3_class_value = "item " + (/*todo*/ ctx[0].completed && "completed") + " svelte-5jd29i");
    			add_location(div3, file, 59, 0, 1018);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			div2.innerHTML = Close;
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div2, "click", stop_propagation(/*handleDelete*/ ctx[2]), false, false, true),
    				listen_dev(div3, "click", /*handleClick*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*todo*/ 1) && raw0_value !== (raw0_value = (/*todo*/ ctx[0].completed ? Add : Inactive) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*todo*/ 1) && t1_value !== (t1_value = /*todo*/ ctx[0].text + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*todo*/ 1 && div3_class_value !== (div3_class_value = "item " + (/*todo*/ ctx[0].completed && "completed") + " svelte-5jd29i")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { todo } = $$props;

    	const handleClick = () => {
    		dispatch("todoItemClick", { id: todo.id });
    	};

    	const handleDelete = () => {
    		dispatch("todoItemDelete", { id: todo.id });
    	};

    	const writable_props = ["todo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToDoItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ToDoItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		createEventDispatcher,
    		Active: Add,
    		Inactive,
    		Close,
    		dispatch,
    		todo,
    		handleClick,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, handleClick, handleDelete];
    }

    class ToDoItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { todo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToDoItem",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<ToDoItem> was created without expected prop 'todo'");
    		}
    	}

    	get todo() {
    		throw new Error("<ToDoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<ToDoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Add$1 = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>";

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var assign = make_assign();
    var create = make_create();
    var trim = make_trim();
    var Global = (typeof window !== 'undefined' ? window : commonjsGlobal);

    var util = {
    	assign: assign,
    	create: create,
    	trim: trim,
    	bind: bind,
    	slice: slice,
    	each: each,
    	map: map,
    	pluck: pluck,
    	isList: isList,
    	isFunction: isFunction,
    	isObject: isObject,
    	Global: Global
    };

    function make_assign() {
    	if (Object.assign) {
    		return Object.assign
    	} else {
    		return function shimAssign(obj, props1, props2, etc) {
    			for (var i = 1; i < arguments.length; i++) {
    				each(Object(arguments[i]), function(val, key) {
    					obj[key] = val;
    				});
    			}			
    			return obj
    		}
    	}
    }

    function make_create() {
    	if (Object.create) {
    		return function create(obj, assignProps1, assignProps2, etc) {
    			var assignArgsList = slice(arguments, 1);
    			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
    		}
    	} else {
    		function F() {} // eslint-disable-line no-inner-declarations
    		return function create(obj, assignProps1, assignProps2, etc) {
    			var assignArgsList = slice(arguments, 1);
    			F.prototype = obj;
    			return assign.apply(this, [new F()].concat(assignArgsList))
    		}
    	}
    }

    function make_trim() {
    	if (String.prototype.trim) {
    		return function trim(str) {
    			return String.prototype.trim.call(str)
    		}
    	} else {
    		return function trim(str) {
    			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    		}
    	}
    }

    function bind(obj, fn) {
    	return function() {
    		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
    	}
    }

    function slice(arr, index) {
    	return Array.prototype.slice.call(arr, index || 0)
    }

    function each(obj, fn) {
    	pluck(obj, function(val, key) {
    		fn(val, key);
    		return false
    	});
    }

    function map(obj, fn) {
    	var res = (isList(obj) ? [] : {});
    	pluck(obj, function(v, k) {
    		res[k] = fn(v, k);
    		return false
    	});
    	return res
    }

    function pluck(obj, fn) {
    	if (isList(obj)) {
    		for (var i=0; i<obj.length; i++) {
    			if (fn(obj[i], i)) {
    				return obj[i]
    			}
    		}
    	} else {
    		for (var key in obj) {
    			if (obj.hasOwnProperty(key)) {
    				if (fn(obj[key], key)) {
    					return obj[key]
    				}
    			}
    		}
    	}
    }

    function isList(val) {
    	return (val != null && typeof val != 'function' && typeof val.length == 'number')
    }

    function isFunction(val) {
    	return val && {}.toString.call(val) === '[object Function]'
    }

    function isObject(val) {
    	return val && {}.toString.call(val) === '[object Object]'
    }

    var slice$1 = util.slice;
    var pluck$1 = util.pluck;
    var each$1 = util.each;
    var bind$1 = util.bind;
    var create$1 = util.create;
    var isList$1 = util.isList;
    var isFunction$1 = util.isFunction;
    var isObject$1 = util.isObject;

    var storeEngine = {
    	createStore: createStore
    };

    var storeAPI = {
    	version: '2.0.12',
    	enabled: false,
    	
    	// get returns the value of the given key. If that value
    	// is undefined, it returns optionalDefaultValue instead.
    	get: function(key, optionalDefaultValue) {
    		var data = this.storage.read(this._namespacePrefix + key);
    		return this._deserialize(data, optionalDefaultValue)
    	},

    	// set will store the given value at key and returns value.
    	// Calling set with value === undefined is equivalent to calling remove.
    	set: function(key, value) {
    		if (value === undefined) {
    			return this.remove(key)
    		}
    		this.storage.write(this._namespacePrefix + key, this._serialize(value));
    		return value
    	},

    	// remove deletes the key and value stored at the given key.
    	remove: function(key) {
    		this.storage.remove(this._namespacePrefix + key);
    	},

    	// each will call the given callback once for each key-value pair
    	// in this store.
    	each: function(callback) {
    		var self = this;
    		this.storage.each(function(val, namespacedKey) {
    			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''));
    		});
    	},

    	// clearAll will remove all the stored key-value pairs in this store.
    	clearAll: function() {
    		this.storage.clearAll();
    	},

    	// additional functionality that can't live in plugins
    	// ---------------------------------------------------

    	// hasNamespace returns true if this store instance has the given namespace.
    	hasNamespace: function(namespace) {
    		return (this._namespacePrefix == '__storejs_'+namespace+'_')
    	},

    	// createStore creates a store.js instance with the first
    	// functioning storage in the list of storage candidates,
    	// and applies the the given mixins to the instance.
    	createStore: function() {
    		return createStore.apply(this, arguments)
    	},
    	
    	addPlugin: function(plugin) {
    		this._addPlugin(plugin);
    	},
    	
    	namespace: function(namespace) {
    		return createStore(this.storage, this.plugins, namespace)
    	}
    };

    function _warn() {
    	var _console = (typeof console == 'undefined' ? null : console);
    	if (!_console) { return }
    	var fn = (_console.warn ? _console.warn : _console.log);
    	fn.apply(_console, arguments);
    }

    function createStore(storages, plugins, namespace) {
    	if (!namespace) {
    		namespace = '';
    	}
    	if (storages && !isList$1(storages)) {
    		storages = [storages];
    	}
    	if (plugins && !isList$1(plugins)) {
    		plugins = [plugins];
    	}

    	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '');
    	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null);
    	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/; // alpha-numeric + underscore and dash
    	if (!legalNamespaces.test(namespace)) {
    		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
    	}
    	
    	var _privateStoreProps = {
    		_namespacePrefix: namespacePrefix,
    		_namespaceRegexp: namespaceRegexp,

    		_testStorage: function(storage) {
    			try {
    				var testStr = '__storejs__test__';
    				storage.write(testStr, testStr);
    				var ok = (storage.read(testStr) === testStr);
    				storage.remove(testStr);
    				return ok
    			} catch(e) {
    				return false
    			}
    		},

    		_assignPluginFnProp: function(pluginFnProp, propName) {
    			var oldFn = this[propName];
    			this[propName] = function pluginFn() {
    				var args = slice$1(arguments, 0);
    				var self = this;

    				// super_fn calls the old function which was overwritten by
    				// this mixin.
    				function super_fn() {
    					if (!oldFn) { return }
    					each$1(arguments, function(arg, i) {
    						args[i] = arg;
    					});
    					return oldFn.apply(self, args)
    				}

    				// Give mixing function access to super_fn by prefixing all mixin function
    				// arguments with super_fn.
    				var newFnArgs = [super_fn].concat(args);

    				return pluginFnProp.apply(self, newFnArgs)
    			};
    		},

    		_serialize: function(obj) {
    			return JSON.stringify(obj)
    		},

    		_deserialize: function(strVal, defaultVal) {
    			if (!strVal) { return defaultVal }
    			// It is possible that a raw string value has been previously stored
    			// in a storage without using store.js, meaning it will be a raw
    			// string value instead of a JSON serialized string. By defaulting
    			// to the raw string value in case of a JSON parse error, we allow
    			// for past stored values to be forwards-compatible with store.js
    			var val = '';
    			try { val = JSON.parse(strVal); }
    			catch(e) { val = strVal; }

    			return (val !== undefined ? val : defaultVal)
    		},
    		
    		_addStorage: function(storage) {
    			if (this.enabled) { return }
    			if (this._testStorage(storage)) {
    				this.storage = storage;
    				this.enabled = true;
    			}
    		},

    		_addPlugin: function(plugin) {
    			var self = this;

    			// If the plugin is an array, then add all plugins in the array.
    			// This allows for a plugin to depend on other plugins.
    			if (isList$1(plugin)) {
    				each$1(plugin, function(plugin) {
    					self._addPlugin(plugin);
    				});
    				return
    			}

    			// Keep track of all plugins we've seen so far, so that we
    			// don't add any of them twice.
    			var seenPlugin = pluck$1(this.plugins, function(seenPlugin) {
    				return (plugin === seenPlugin)
    			});
    			if (seenPlugin) {
    				return
    			}
    			this.plugins.push(plugin);

    			// Check that the plugin is properly formed
    			if (!isFunction$1(plugin)) {
    				throw new Error('Plugins must be function values that return objects')
    			}

    			var pluginProperties = plugin.call(this);
    			if (!isObject$1(pluginProperties)) {
    				throw new Error('Plugins must return an object of function properties')
    			}

    			// Add the plugin function properties to this store instance.
    			each$1(pluginProperties, function(pluginFnProp, propName) {
    				if (!isFunction$1(pluginFnProp)) {
    					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
    				}
    				self._assignPluginFnProp(pluginFnProp, propName);
    			});
    		},
    		
    		// Put deprecated properties in the private API, so as to not expose it to accidential
    		// discovery through inspection of the store object.
    		
    		// Deprecated: addStorage
    		addStorage: function(storage) {
    			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])');
    			this._addStorage(storage);
    		}
    	};

    	var store = create$1(_privateStoreProps, storeAPI, {
    		plugins: []
    	});
    	store.raw = {};
    	each$1(store, function(prop, propName) {
    		if (isFunction$1(prop)) {
    			store.raw[propName] = bind$1(store, prop);			
    		}
    	});
    	each$1(storages, function(storage) {
    		store._addStorage(storage);
    	});
    	each$1(plugins, function(plugin) {
    		store._addPlugin(plugin);
    	});
    	return store
    }

    var Global$1 = util.Global;

    var localStorage_1 = {
    	name: 'localStorage',
    	read: read,
    	write: write,
    	each: each$2,
    	remove: remove,
    	clearAll: clearAll,
    };

    function localStorage() {
    	return Global$1.localStorage
    }

    function read(key) {
    	return localStorage().getItem(key)
    }

    function write(key, data) {
    	return localStorage().setItem(key, data)
    }

    function each$2(fn) {
    	for (var i = localStorage().length - 1; i >= 0; i--) {
    		var key = localStorage().key(i);
    		fn(read(key), key);
    	}
    }

    function remove(key) {
    	return localStorage().removeItem(key)
    }

    function clearAll() {
    	return localStorage().clear()
    }

    // oldFF-globalStorage provides storage for Firefox
    // versions 6 and 7, where no localStorage, etc
    // is available.


    var Global$2 = util.Global;

    var oldFFGlobalStorage = {
    	name: 'oldFF-globalStorage',
    	read: read$1,
    	write: write$1,
    	each: each$3,
    	remove: remove$1,
    	clearAll: clearAll$1,
    };

    var globalStorage = Global$2.globalStorage;

    function read$1(key) {
    	return globalStorage[key]
    }

    function write$1(key, data) {
    	globalStorage[key] = data;
    }

    function each$3(fn) {
    	for (var i = globalStorage.length - 1; i >= 0; i--) {
    		var key = globalStorage.key(i);
    		fn(globalStorage[key], key);
    	}
    }

    function remove$1(key) {
    	return globalStorage.removeItem(key)
    }

    function clearAll$1() {
    	each$3(function(key, _) {
    		delete globalStorage[key];
    	});
    }

    // oldIE-userDataStorage provides storage for Internet Explorer
    // versions 6 and 7, where no localStorage, sessionStorage, etc
    // is available.


    var Global$3 = util.Global;

    var oldIEUserDataStorage = {
    	name: 'oldIE-userDataStorage',
    	write: write$2,
    	read: read$2,
    	each: each$4,
    	remove: remove$2,
    	clearAll: clearAll$2,
    };

    var storageName = 'storejs';
    var doc = Global$3.document;
    var _withStorageEl = _makeIEStorageElFunction();
    var disable = (Global$3.navigator ? Global$3.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./); // MSIE 9.x, MSIE 10.x

    function write$2(unfixedKey, data) {
    	if (disable) { return }
    	var fixedKey = fixKey(unfixedKey);
    	_withStorageEl(function(storageEl) {
    		storageEl.setAttribute(fixedKey, data);
    		storageEl.save(storageName);
    	});
    }

    function read$2(unfixedKey) {
    	if (disable) { return }
    	var fixedKey = fixKey(unfixedKey);
    	var res = null;
    	_withStorageEl(function(storageEl) {
    		res = storageEl.getAttribute(fixedKey);
    	});
    	return res
    }

    function each$4(callback) {
    	_withStorageEl(function(storageEl) {
    		var attributes = storageEl.XMLDocument.documentElement.attributes;
    		for (var i=attributes.length-1; i>=0; i--) {
    			var attr = attributes[i];
    			callback(storageEl.getAttribute(attr.name), attr.name);
    		}
    	});
    }

    function remove$2(unfixedKey) {
    	var fixedKey = fixKey(unfixedKey);
    	_withStorageEl(function(storageEl) {
    		storageEl.removeAttribute(fixedKey);
    		storageEl.save(storageName);
    	});
    }

    function clearAll$2() {
    	_withStorageEl(function(storageEl) {
    		var attributes = storageEl.XMLDocument.documentElement.attributes;
    		storageEl.load(storageName);
    		for (var i=attributes.length-1; i>=0; i--) {
    			storageEl.removeAttribute(attributes[i].name);
    		}
    		storageEl.save(storageName);
    	});
    }

    // Helpers
    //////////

    // In IE7, keys cannot start with a digit or contain certain chars.
    // See https://github.com/marcuswestin/store.js/issues/40
    // See https://github.com/marcuswestin/store.js/issues/83
    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
    function fixKey(key) {
    	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
    }

    function _makeIEStorageElFunction() {
    	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
    		return null
    	}
    	var scriptTag = 'script',
    		storageOwner,
    		storageContainer,
    		storageEl;

    	// Since #userData storage applies only to specific paths, we need to
    	// somehow link our data to a specific path.  We choose /favicon.ico
    	// as a pretty safe option, since all browsers already make a request to
    	// this URL anyway and being a 404 will not hurt us here.  We wrap an
    	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
    	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
    	// since the iframe access rules appear to allow direct access and
    	// manipulation of the document element, even for a 404 page.  This
    	// document can be used instead of the current document (which would
    	// have been limited to the current path) to perform #userData storage.
    	try {
    		/* global ActiveXObject */
    		storageContainer = new ActiveXObject('htmlfile');
    		storageContainer.open();
    		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
    		storageContainer.close();
    		storageOwner = storageContainer.w.frames[0].document;
    		storageEl = storageOwner.createElement('div');
    	} catch(e) {
    		// somehow ActiveXObject instantiation failed (perhaps some special
    		// security settings or otherwse), fall back to per-path storage
    		storageEl = doc.createElement('div');
    		storageOwner = doc.body;
    	}

    	return function(storeFunction) {
    		var args = [].slice.call(arguments, 0);
    		args.unshift(storageEl);
    		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
    		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
    		storageOwner.appendChild(storageEl);
    		storageEl.addBehavior('#default#userData');
    		storageEl.load(storageName);
    		storeFunction.apply(this, args);
    		storageOwner.removeChild(storageEl);
    		return
    	}
    }

    // cookieStorage is useful Safari private browser mode, where localStorage
    // doesn't work but cookies do. This implementation is adopted from
    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage


    var Global$4 = util.Global;
    var trim$1 = util.trim;

    var cookieStorage = {
    	name: 'cookieStorage',
    	read: read$3,
    	write: write$3,
    	each: each$5,
    	remove: remove$3,
    	clearAll: clearAll$3,
    };

    var doc$1 = Global$4.document;

    function read$3(key) {
    	if (!key || !_has(key)) { return null }
    	var regexpStr = "(?:^|.*;\\s*)" +
    		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
    		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";
    	return unescape(doc$1.cookie.replace(new RegExp(regexpStr), "$1"))
    }

    function each$5(callback) {
    	var cookies = doc$1.cookie.split(/; ?/g);
    	for (var i = cookies.length - 1; i >= 0; i--) {
    		if (!trim$1(cookies[i])) {
    			continue
    		}
    		var kvp = cookies[i].split('=');
    		var key = unescape(kvp[0]);
    		var val = unescape(kvp[1]);
    		callback(val, key);
    	}
    }

    function write$3(key, data) {
    	if(!key) { return }
    	doc$1.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
    }

    function remove$3(key) {
    	if (!key || !_has(key)) {
    		return
    	}
    	doc$1.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

    function clearAll$3() {
    	each$5(function(_, key) {
    		remove$3(key);
    	});
    }

    function _has(key) {
    	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc$1.cookie)
    }

    var Global$5 = util.Global;

    var sessionStorage_1 = {
    	name: 'sessionStorage',
    	read: read$4,
    	write: write$4,
    	each: each$6,
    	remove: remove$4,
    	clearAll: clearAll$4
    };

    function sessionStorage() {
    	return Global$5.sessionStorage
    }

    function read$4(key) {
    	return sessionStorage().getItem(key)
    }

    function write$4(key, data) {
    	return sessionStorage().setItem(key, data)
    }

    function each$6(fn) {
    	for (var i = sessionStorage().length - 1; i >= 0; i--) {
    		var key = sessionStorage().key(i);
    		fn(read$4(key), key);
    	}
    }

    function remove$4(key) {
    	return sessionStorage().removeItem(key)
    }

    function clearAll$4() {
    	return sessionStorage().clear()
    }

    // memoryStorage is a useful last fallback to ensure that the store
    // is functions (meaning store.get(), store.set(), etc will all function).
    // However, stored values will not persist when the browser navigates to
    // a new page or reloads the current page.

    var memoryStorage_1 = {
    	name: 'memoryStorage',
    	read: read$5,
    	write: write$5,
    	each: each$7,
    	remove: remove$5,
    	clearAll: clearAll$5,
    };

    var memoryStorage = {};

    function read$5(key) {
    	return memoryStorage[key]
    }

    function write$5(key, data) {
    	memoryStorage[key] = data;
    }

    function each$7(callback) {
    	for (var key in memoryStorage) {
    		if (memoryStorage.hasOwnProperty(key)) {
    			callback(memoryStorage[key], key);
    		}
    	}
    }

    function remove$5(key) {
    	delete memoryStorage[key];
    }

    function clearAll$5(key) {
    	memoryStorage = {};
    }

    var all = [
    	// Listed in order of usage preference
    	localStorage_1,
    	oldFFGlobalStorage,
    	oldIEUserDataStorage,
    	cookieStorage,
    	sessionStorage_1,
    	memoryStorage_1
    ];

    /* eslint-disable */

    //  json2.js
    //  2016-10-28
    //  Public Domain.
    //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    //  See http://www.JSON.org/js.html
    //  This code should be minified before deployment.
    //  See http://javascript.crockford.com/jsmin.html

    //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    //  NOT CONTROL.

    //  This file creates a global JSON object containing two methods: stringify
    //  and parse. This file provides the ES5 JSON capability to ES3 systems.
    //  If a project might run on IE8 or earlier, then this file should be included.
    //  This file does nothing on ES5 systems.

    //      JSON.stringify(value, replacer, space)
    //          value       any JavaScript value, usually an object or array.
    //          replacer    an optional parameter that determines how object
    //                      values are stringified for objects. It can be a
    //                      function or an array of strings.
    //          space       an optional parameter that specifies the indentation
    //                      of nested structures. If it is omitted, the text will
    //                      be packed without extra whitespace. If it is a number,
    //                      it will specify the number of spaces to indent at each
    //                      level. If it is a string (such as "\t" or "&nbsp;"),
    //                      it contains the characters used to indent at each level.
    //          This method produces a JSON text from a JavaScript value.
    //          When an object value is found, if the object contains a toJSON
    //          method, its toJSON method will be called and the result will be
    //          stringified. A toJSON method does not serialize: it returns the
    //          value represented by the name/value pair that should be serialized,
    //          or undefined if nothing should be serialized. The toJSON method
    //          will be passed the key associated with the value, and this will be
    //          bound to the value.

    //          For example, this would serialize Dates as ISO strings.

    //              Date.prototype.toJSON = function (key) {
    //                  function f(n) {
    //                      // Format integers to have at least two digits.
    //                      return (n < 10)
    //                          ? "0" + n
    //                          : n;
    //                  }
    //                  return this.getUTCFullYear()   + "-" +
    //                       f(this.getUTCMonth() + 1) + "-" +
    //                       f(this.getUTCDate())      + "T" +
    //                       f(this.getUTCHours())     + ":" +
    //                       f(this.getUTCMinutes())   + ":" +
    //                       f(this.getUTCSeconds())   + "Z";
    //              };

    //          You can provide an optional replacer method. It will be passed the
    //          key and value of each member, with this bound to the containing
    //          object. The value that is returned from your method will be
    //          serialized. If your method returns undefined, then the member will
    //          be excluded from the serialization.

    //          If the replacer parameter is an array of strings, then it will be
    //          used to select the members to be serialized. It filters the results
    //          such that only members with keys listed in the replacer array are
    //          stringified.

    //          Values that do not have JSON representations, such as undefined or
    //          functions, will not be serialized. Such values in objects will be
    //          dropped; in arrays they will be replaced with null. You can use
    //          a replacer function to replace those with JSON values.

    //          JSON.stringify(undefined) returns undefined.

    //          The optional space parameter produces a stringification of the
    //          value that is filled with line breaks and indentation to make it
    //          easier to read.

    //          If the space parameter is a non-empty string, then that string will
    //          be used for indentation. If the space parameter is a number, then
    //          the indentation will be that many spaces.

    //          Example:

    //          text = JSON.stringify(["e", {pluribus: "unum"}]);
    //          // text is '["e",{"pluribus":"unum"}]'

    //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
    //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

    //          text = JSON.stringify([new Date()], function (key, value) {
    //              return this[key] instanceof Date
    //                  ? "Date(" + this[key] + ")"
    //                  : value;
    //          });
    //          // text is '["Date(---current time---)"]'

    //      JSON.parse(text, reviver)
    //          This method parses a JSON text to produce an object or array.
    //          It can throw a SyntaxError exception.

    //          The optional reviver parameter is a function that can filter and
    //          transform the results. It receives each of the keys and values,
    //          and its return value is used instead of the original value.
    //          If it returns what it received, then the structure is not modified.
    //          If it returns undefined then the member is deleted.

    //          Example:

    //          // Parse the text. Values that look like ISO date strings will
    //          // be converted to Date objects.

    //          myData = JSON.parse(text, function (key, value) {
    //              var a;
    //              if (typeof value === "string") {
    //                  a =
    //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    //                  if (a) {
    //                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
    //                          +a[5], +a[6]));
    //                  }
    //              }
    //              return value;
    //          });

    //          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
    //              var d;
    //              if (typeof value === "string" &&
    //                      value.slice(0, 5) === "Date(" &&
    //                      value.slice(-1) === ")") {
    //                  d = new Date(value.slice(5, -1));
    //                  if (d) {
    //                      return d;
    //                  }
    //              }
    //              return value;
    //          });

    //  This is a reference implementation. You are free to copy, modify, or
    //  redistribute.

    /*jslint
        eval, for, this
    */

    /*property
        JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
        getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
        lastIndex, length, parse, prototype, push, replace, slice, stringify,
        test, toJSON, toString, valueOf
    */


    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

    if (typeof JSON !== "object") {
        JSON = {};
    }

    (function () {

        var rx_one = /^[\],:{}\s]*$/;
        var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
        var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10
                ? "0" + n
                : n;
        }

        function this_value() {
            return this.valueOf();
        }

        if (typeof Date.prototype.toJSON !== "function") {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + "-" +
                            f(this.getUTCMonth() + 1) + "-" +
                            f(this.getUTCDate()) + "T" +
                            f(this.getUTCHours()) + ":" +
                            f(this.getUTCMinutes()) + ":" +
                            f(this.getUTCSeconds()) + "Z"
                    : null;
            };

            Boolean.prototype.toJSON = this_value;
            Number.prototype.toJSON = this_value;
            String.prototype.toJSON = this_value;
        }

        var gap;
        var indent;
        var meta;
        var rep;


        function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

            rx_escapable.lastIndex = 0;
            return rx_escapable.test(string)
                ? "\"" + string.replace(rx_escapable, function (a) {
                    var c = meta[a];
                    return typeof c === "string"
                        ? c
                        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                }) + "\""
                : "\"" + string + "\"";
        }


        function str(key, holder) {

    // Produce a string from holder[key].

            var i;          // The loop counter.
            var k;          // The member key.
            var v;          // The member value.
            var length;
            var mind = gap;
            var partial;
            var value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === "object" &&
                    typeof value.toJSON === "function") {
                value = value.toJSON(key);
            }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

            if (typeof rep === "function") {
                value = rep.call(holder, key, value);
            }

    // What happens next depends on the value's type.

            switch (typeof value) {
            case "string":
                return quote(value);

            case "number":

    // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value)
                    ? String(value)
                    : "null";

            case "boolean":
            case "null":

    // If the value is a boolean or null, convert it to a string. Note:
    // typeof null does not produce "null". The case is included here in
    // the remote chance that this gets fixed someday.

                return String(value);

    // If the type is "object", we might be dealing with an object or an array or
    // null.

            case "object":

    // Due to a specification blunder in ECMAScript, typeof null is "object",
    // so watch out for that case.

                if (!value) {
                    return "null";
                }

    // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

    // Is the value an array?

                if (Object.prototype.toString.apply(value) === "[object Array]") {

    // The value is an array. Stringify every element. Use null as a placeholder
    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

    // Join all of the elements together, separated with commas, and wrap them in
    // brackets.

                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

    // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                } else {

    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                }

    // Join all of the member texts together, separated with commas,
    // and wrap them in braces.

                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
            }
        }

    // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== "function") {
            meta = {    // table of character substitutions
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                "\"": "\\\"",
                "\\": "\\\\"
            };
            JSON.stringify = function (value, replacer, space) {

    // The stringify method takes a value and an optional replacer, and an optional
    // space parameter, and returns a JSON text. The replacer can be a function
    // that can replace values, or an array of strings that will select the keys.
    // A default replacer method can be provided. Use of the space parameter can
    // produce text that is more easily readable.

                var i;
                gap = "";
                indent = "";

    // If the space parameter is a number, make an indent string containing that
    // many spaces.

                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " ";
                    }

    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === "string") {
                    indent = space;
                }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== "function" &&
                        (typeof replacer !== "object" ||
                        typeof replacer.length !== "number")) {
                    throw new Error("JSON.stringify");
                }

    // Make a fake root object containing our value under the key of "".
    // Return the result of stringifying the value.

                return str("", {"": value});
            };
        }


    // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== "function") {
            JSON.parse = function (text, reviver) {

    // The parse method takes a text and an optional reviver function, and returns
    // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

    // The walk method is used to recursively walk the resulting structure so
    // that modifications can be made.

                    var k;
                    var v;
                    var value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                rx_dangerous.lastIndex = 0;
                if (rx_dangerous.test(text)) {
                    text = text.replace(rx_dangerous, function (a) {
                        return "\\u" +
                                ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with "()" and "new"
    // because they can cause invocation, and "=" because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
    // replace all simple value tokens with "]" characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or "]" or
    // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

                if (
                    rx_one.test(
                        text
                            .replace(rx_two, "@")
                            .replace(rx_three, "]")
                            .replace(rx_four, "")
                    )
                ) {

    // In the third stage we use the eval function to compile the text into a
    // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

                    j = eval("(" + text + ")");

    // In the optional fourth stage, we recursively walk the new structure, passing
    // each name/value pair to a reviver function for possible transformation.

                    return (typeof reviver === "function")
                        ? walk({"": j}, "")
                        : j;
                }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError("JSON.parse");
            };
        }
    }());

    var json2 = json2Plugin;

    function json2Plugin() {
    	
    	return {}
    }

    var plugins = [json2];

    var store_legacy = storeEngine.createStore(all, plugins);

    const TABS = {
        ACTIVE: "active",
        ALL: "all",
        DONE: "done",
    };

    const initialUIState = {
        activeTab: store_legacy.get("activeTab") || TABS.ALL,
        inputBoxShown: false,
    };

    const createUIStore = () => {
        const {subscribe, update} = writable(initialUIState);

        return {
            subscribe,
            setActiveTab: (activeTab) => update(state => {
                store_legacy.set("activeTab", activeTab);
                return {
                    ...state,
                    activeTab
                }
            }),
            setInputBoxShown: (inputBoxShown) => update(state => ({
                ...state,
                inputBoxShown
            })),
        }
    };

    const ui = createUIStore();

    /* src/components/Empty.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/components/Empty.svelte";

    // (89:0) {:else}
    function create_else_block(ctx) {
    	let div4;
    	let div1;
    	let h3;
    	let t0_value = /*message*/ ctx[1].header + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*message*/ ctx[1].message + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let raw_value = /*message*/ ctx[1].icon + "";
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			add_location(h3, file$1, 91, 6, 1890);
    			add_location(div0, file$1, 92, 6, 1922);
    			attr_dev(div1, "class", "text svelte-1v5wpmd");
    			add_location(div1, file$1, 90, 4, 1865);
    			attr_dev(div2, "class", "svg svelte-1v5wpmd");
    			add_location(div2, file$1, 95, 6, 1991);
    			attr_dev(div3, "class", "icon svelte-1v5wpmd");
    			add_location(div3, file$1, 94, 4, 1966);
    			attr_dev(div4, "class", "empty svelte-1v5wpmd");
    			add_location(div4, file$1, 89, 2, 1809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			div2.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*message*/ 2) && t0_value !== (t0_value = /*message*/ ctx[1].header + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*message*/ 2) && t2_value !== (t2_value = /*message*/ ctx[1].message + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*message*/ 2) && raw_value !== (raw_value = /*message*/ ctx[1].icon + "")) div2.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fade, { delay: 500 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(89:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:36) 
    function create_if_block_1(ctx) {
    	let div4;
    	let div1;
    	let h3;
    	let t0_value = /*message*/ ctx[1].header + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*message*/ ctx[1].message + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let raw_value = /*message*/ ctx[1].icon + "";
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			add_location(h3, file$1, 79, 6, 1618);
    			add_location(div0, file$1, 80, 6, 1650);
    			attr_dev(div1, "class", "text svelte-1v5wpmd");
    			add_location(div1, file$1, 78, 4, 1593);
    			attr_dev(div2, "class", "svg svelte-1v5wpmd");
    			add_location(div2, file$1, 83, 6, 1719);
    			attr_dev(div3, "class", "icon svelte-1v5wpmd");
    			add_location(div3, file$1, 82, 4, 1694);
    			attr_dev(div4, "class", "empty svelte-1v5wpmd");
    			add_location(div4, file$1, 77, 2, 1537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			div2.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*message*/ 2) && t0_value !== (t0_value = /*message*/ ctx[1].header + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*message*/ 2) && t2_value !== (t2_value = /*message*/ ctx[1].message + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*message*/ 2) && raw_value !== (raw_value = /*message*/ ctx[1].icon + "")) div2.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fade, { delay: 500 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(77:36) ",
    		ctx
    	});

    	return block;
    }

    // (65:0) {#if activeTab === TABS.ALL}
    function create_if_block(ctx) {
    	let div4;
    	let div1;
    	let h3;
    	let t0_value = /*message*/ ctx[1].header + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*message*/ ctx[1].message + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let raw_value = /*message*/ ctx[1].icon + "";
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			add_location(h3, file$1, 67, 6, 1317);
    			add_location(div0, file$1, 68, 6, 1349);
    			attr_dev(div1, "class", "text svelte-1v5wpmd");
    			add_location(div1, file$1, 66, 4, 1292);
    			attr_dev(div2, "class", "svg svelte-1v5wpmd");
    			add_location(div2, file$1, 71, 6, 1418);
    			attr_dev(div3, "class", "icon svelte-1v5wpmd");
    			add_location(div3, file$1, 70, 4, 1393);
    			attr_dev(div4, "class", "empty svelte-1v5wpmd");
    			add_location(div4, file$1, 65, 2, 1236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			div2.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*message*/ 2) && t0_value !== (t0_value = /*message*/ ctx[1].header + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*message*/ 2) && t2_value !== (t2_value = /*message*/ ctx[1].message + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*message*/ 2) && raw_value !== (raw_value = /*message*/ ctx[1].icon + "")) div2.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fade, { delay: 500 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(65:0) {#if activeTab === TABS.ALL}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeTab*/ ctx[0] === TABS.ALL) return 0;
    		if (/*activeTab*/ ctx[0] === TABS.ACTIVE) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { activeTab } = $$props;
    	const writable_props = ["activeTab"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Empty> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Empty", $$slots, []);

    	$$self.$set = $$props => {
    		if ("activeTab" in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	$$self.$capture_state = () => ({
    		Add: Add$1,
    		Active: Add,
    		Inactive,
    		TABS,
    		fade,
    		activeTab,
    		message
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeTab" in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    	};

    	let message;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeTab*/ 1) {
    			 $$invalidate(1, message = ({
    				[TABS.ALL]: {
    					header: "Hallo !",
    					message: "Add away your todo by clicking the + button",
    					icon: Add$1
    				},
    				[TABS.ACTIVE]: {
    					header: "!",
    					message: "You dont have any active todos!",
    					icon: Inactive
    				},
    				[TABS.DONE]: {
    					header: "!",
    					message: "You dont have any completed todos!",
    					icon: Add
    				}
    			})[activeTab]);
    		}
    	};

    	return [activeTab, message];
    }

    class Empty extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { activeTab: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Empty",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeTab*/ ctx[0] === undefined && !("activeTab" in props)) {
    			console.warn("<Empty> was created without expected prop 'activeTab'");
    		}
    	}

    	get activeTab() {
    		throw new Error("<Empty>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeTab(value) {
    		throw new Error("<Empty>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const initialTodos = store_legacy.get("todos");

    const persistTodos = (todos) => store_legacy.set("todos", todos);

    function createTodos() {
    	const { subscribe, update } = writable(initialTodos || []);

    	return {
    		subscribe,
    		toggle: (id) => update(items => {
    			const all = items.map(item => {
    				if (item.id === id) {
    					item.completed = !item.completed;
    				}
    				return item;
    			});
    			persistTodos(all);
    			return all;
    		}),
    		delete: (id) => update(items => {
    			const all = items.filter(item => item.id !== id);
    			persistTodos(all);
    			return all;
    		}),
    		addTodo: (text) => update(items => {
    			const all = [{id: items.length, text, completed: false}, ...items];
    			persistTodos(all);
    			return all;
    		})
    	};
    }

    const todos = createTodos();

    /* src/components/ToDos.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/components/ToDos.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (47:2) {:else}
    function create_else_block$1(ctx) {
    	let current;

    	const empty_1 = new Empty({
    			props: { activeTab: /*$ui*/ ctx[1].activeTab },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(empty_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(empty_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const empty_1_changes = {};
    			if (dirty & /*$ui*/ 2) empty_1_changes.activeTab = /*$ui*/ ctx[1].activeTab;
    			empty_1.$set(empty_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(empty_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(empty_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(empty_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(47:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#each displayedTodos as todo}
    function create_each_block(ctx) {
    	let current;

    	const todoitem = new ToDoItem({
    			props: { todo: /*todo*/ ctx[6] },
    			$$inline: true
    		});

    	todoitem.$on("todoItemClick", /*handleSelect*/ ctx[2]);
    	todoitem.$on("todoItemDelete", /*handleDelete*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(todoitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todoitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todoitem_changes = {};
    			if (dirty & /*displayedTodos*/ 1) todoitem_changes.todo = /*todo*/ ctx[6];
    			todoitem.$set(todoitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todoitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:2) {#each displayedTodos as todo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*displayedTodos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "content svelte-1olkt0j");
    			add_location(div, file$2, 40, 0, 880);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*displayedTodos, handleSelect, handleDelete, $ui*/ 15) {
    				each_value = /*displayedTodos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $ui;
    	let $todos;
    	validate_store(ui, "ui");
    	component_subscribe($$self, ui, $$value => $$invalidate(1, $ui = $$value));
    	validate_store(todos, "todos");
    	component_subscribe($$self, todos, $$value => $$invalidate(4, $todos = $$value));
    	let displayedTodos;

    	const setDisplayed = (todos, active) => ({
    		[TABS.ALL]: todos,
    		[TABS.ACTIVE]: todos.filter(todo => todo.completed === false),
    		[TABS.DONE]: todos.filter(todo => todo.completed === true)
    	})[active];

    	todos.subscribe(todos => {
    		$$invalidate(0, displayedTodos = setDisplayed(todos, $ui.activeTab));
    	});

    	ui.subscribe(ui => {
    		$$invalidate(0, displayedTodos = setDisplayed($todos, ui.activeTab));
    	});

    	const handleSelect = ({ detail: { id } }) => {
    		todos.toggle(id);
    	};

    	const handleDelete = ({ detail: { id } }) => {
    		todos.delete(id);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToDos> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ToDos", $$slots, []);

    	$$self.$capture_state = () => ({
    		ToDoItem,
    		Empty,
    		todos,
    		ui,
    		TABS,
    		displayedTodos,
    		setDisplayed,
    		handleSelect,
    		handleDelete,
    		$ui,
    		$todos
    	});

    	$$self.$inject_state = $$props => {
    		if ("displayedTodos" in $$props) $$invalidate(0, displayedTodos = $$props.displayedTodos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [displayedTodos, $ui, handleSelect, handleDelete];
    }

    class ToDos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToDos",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function escapeHandler(setter) {
        const onPopState = () => {
            setter(false);
        };

        const escFunction = (event) => {
            if (event.keyCode === 27) {
                setter(false);
            }
        };

        window.addEventListener("popstate", onPopState);
        document.addEventListener("keydown", escFunction, false);

        window.history.pushState({ drawer: Math.random() }, "Drawer");

    	onDestroy(() => {
            window.removeEventListener("popstate", onPopState);
            document.removeEventListener("keydown", escFunction, false);
        });
    }

    /* src/components/Input.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/components/Input.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let input;
    	let t;
    	let div1;
    	let div0;
    	let div2_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			input = element("input");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "type what you want to do!");
    			attr_dev(input, "class", "svelte-gth9e6");
    			add_location(input, file$3, 97, 2, 2007);
    			attr_dev(div0, "class", "svg svelte-gth9e6");
    			add_location(div0, file$3, 104, 4, 2221);
    			attr_dev(div1, "class", "add svelte-gth9e6");
    			add_location(div1, file$3, 103, 2, 2164);
    			attr_dev(div2, "class", "layout svelte-gth9e6");
    			add_location(div2, file$3, 96, 0, 1924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[6](input);
    			set_input_value(input, /*inputText*/ ctx[0]);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = Add;
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window, "keydown", /*handleKeydown*/ ctx[2], false, false, false),
    				listen_dev(input, "click", stop_propagation(/*click_handler*/ ctx[5]), false, false, true),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    				listen_dev(div1, "click", stop_propagation(/*addToDo*/ ctx[3]), false, false, true),
    				listen_dev(div2, "click", /*click_handler_1*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputText*/ 1 && input.value !== /*inputText*/ ctx[0]) {
    				set_input_value(input, /*inputText*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[6](null);
    			if (detaching && div2_transition) div2_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let inputText = "";
    	let inputElement;

    	onMount(() => {
    		inputElement.focus();
    		escapeHandler(ui.setInputBoxShown);
    	});

    	function handleKeydown(event) {
    		if (event.keyCode === 13) {
    			addToDo();
    		}
    	}

    	const addToDo = () => {
    		if (inputText.trim()) {
    			ui.setInputBoxShown(false);
    			ui.setActiveTab(TABS.ALL);
    			dispatch("addToDo", { text: inputText });
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, inputElement = $$value);
    		});
    	}

    	function input_input_handler() {
    		inputText = this.value;
    		$$invalidate(0, inputText);
    	}

    	const click_handler_1 = () => ui.setInputBoxShown(false);

    	$$self.$capture_state = () => ({
    		Add,
    		ui,
    		TABS,
    		escapeHandler,
    		createEventDispatcher,
    		onMount,
    		fade,
    		dispatch,
    		inputText,
    		inputElement,
    		handleKeydown,
    		addToDo
    	});

    	$$self.$inject_state = $$props => {
    		if ("inputText" in $$props) $$invalidate(0, inputText = $$props.inputText);
    		if ("inputElement" in $$props) $$invalidate(1, inputElement = $$props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		inputText,
    		inputElement,
    		handleKeydown,
    		addToDo,
    		dispatch,
    		click_handler,
    		input_binding,
    		input_input_handler,
    		click_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/components/Footer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (92:4) {#each Object.keys(TABS) as tabKey}
    function create_each_block$1(ctx) {
    	let div;
    	let t0_value = TABS[/*tabKey*/ ctx[5]] + "";
    	let t0;
    	let t1;
    	let div_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", div_class_value = "block " + (/*$ui*/ ctx[0].activeTab === TABS[/*tabKey*/ ctx[5]] && "active") + " svelte-11jbjvp");
    			add_location(div, file$4, 92, 6, 1802);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*handleTabClick*/ ctx[3](TABS[/*tabKey*/ ctx[5]]), false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$ui*/ 1 && div_class_value !== (div_class_value = "block " + (/*$ui*/ ctx[0].activeTab === TABS[/*tabKey*/ ctx[5]] && "active") + " svelte-11jbjvp")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(92:4) {#each Object.keys(TABS) as tabKey}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if $ui.inputBoxShown}
    function create_if_block$1(ctx) {
    	let current;
    	const input = new Input({ $$inline: true });
    	input.$on("addToDo", /*handleAddTodo*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(108:0) {#if $ui.inputBoxShown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let t1;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	let each_value = Object.keys(TABS);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*$ui*/ ctx[0].inputBoxShown && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "groups svelte-11jbjvp");
    			add_location(div0, file$4, 90, 2, 1735);
    			attr_dev(div1, "class", "footer svelte-11jbjvp");
    			add_location(div1, file$4, 89, 0, 1712);
    			attr_dev(div2, "class", "svg svelte-11jbjvp");
    			add_location(div2, file$4, 102, 2, 2034);
    			attr_dev(div3, "class", "add svelte-11jbjvp");
    			add_location(div3, file$4, 101, 0, 1988);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			div2.innerHTML = Add$1;
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div3, "click", /*handleAddClick*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ui, TABS, Object, handleTabClick*/ 9) {
    				each_value = Object.keys(TABS);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*$ui*/ ctx[0].inputBoxShown) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $ui;
    	validate_store(ui, "ui");
    	component_subscribe($$self, ui, $$value => $$invalidate(0, $ui = $$value));
    	let showInput = false;

    	const handleAddClick = () => {
    		ui.setInputBoxShown(true);
    	};

    	const handleAddTodo = ({ detail }) => {
    		showInput = false;
    		todos.addTodo(detail.text);
    	};

    	const handleTabClick = activeTab => () => {
    		ui.setActiveTab(activeTab);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);

    	$$self.$capture_state = () => ({
    		Add: Add$1,
    		Input,
    		todos,
    		ui,
    		TABS,
    		showInput,
    		handleAddClick,
    		handleAddTodo,
    		handleTabClick,
    		$ui
    	});

    	$$self.$inject_state = $$props => {
    		if ("showInput" in $$props) showInput = $$props.showInput;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$ui, handleAddClick, handleAddTodo, handleTabClick];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const todos = new ToDos({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			create_component(todos.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "header svelte-hgkjq");
    			add_location(div0, file$5, 50, 2, 850);
    			attr_dev(div1, "class", "main svelte-hgkjq");
    			add_location(div1, file$5, 49, 0, 829);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			mount_component(todos, div1, null);
    			append_dev(div1, t2);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todos.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todos.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(todos);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ ToDos, Footer, Add: Add$1, name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: '🦠 tu-tu-do 🦠'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
