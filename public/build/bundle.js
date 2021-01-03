
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
            set_current_component(null);
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
    const outroing = new Set();
    let outros;
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\UI-Rebuilds\Spotify-UI.svelte generated by Svelte v3.31.1 */

    const file = "src\\UI-Rebuilds\\Spotify-UI.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div111;
    	let div109;
    	let div3;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let svg0;
    	let path0;
    	let t0;
    	let span0;
    	let t2;
    	let li1;
    	let a1;
    	let svg1;
    	let path1;
    	let t3;
    	let span1;
    	let t5;
    	let li2;
    	let a2;
    	let svg2;
    	let path2;
    	let t6;
    	let span2;
    	let t8;
    	let ul2;
    	let li5;
    	let a3;
    	let h1;
    	let t10;
    	let ul1;
    	let li3;
    	let a4;
    	let svg3;
    	let path3;
    	let t11;
    	let span3;
    	let t13;
    	let li4;
    	let a5;
    	let svg4;
    	let path4;
    	let t14;
    	let span4;
    	let t16;
    	let hr;
    	let t17;
    	let div1;
    	let ul3;
    	let li6;
    	let a6;
    	let t19;
    	let li7;
    	let a7;
    	let t21;
    	let li8;
    	let a8;
    	let t23;
    	let li9;
    	let a9;
    	let t25;
    	let li10;
    	let a10;
    	let t27;
    	let li11;
    	let a11;
    	let t29;
    	let li12;
    	let a12;
    	let t31;
    	let li13;
    	let a13;
    	let t33;
    	let li14;
    	let a14;
    	let t35;
    	let li15;
    	let a15;
    	let t37;
    	let li16;
    	let a16;
    	let t39;
    	let li17;
    	let a17;
    	let t41;
    	let li18;
    	let a18;
    	let t43;
    	let li19;
    	let a19;
    	let t45;
    	let div2;
    	let svg5;
    	let path5;
    	let t46;
    	let a20;
    	let t48;
    	let div108;
    	let div6;
    	let div4;
    	let button0;
    	let svg6;
    	let path6;
    	let t49;
    	let button1;
    	let svg7;
    	let path7;
    	let t50;
    	let div5;
    	let button2;
    	let svg8;
    	let path8;
    	let t51;
    	let a21;
    	let t53;
    	let button3;
    	let svg9;
    	let path9;
    	let t54;
    	let div107;
    	let div106;
    	let div7;
    	let a22;
    	let t56;
    	let a23;
    	let t58;
    	let div39;
    	let div38;
    	let div12;
    	let div11;
    	let div8;
    	let a24;
    	let img0;
    	let img0_src_value;
    	let t59;
    	let div10;
    	let a25;
    	let t61;
    	let div9;
    	let t63;
    	let div17;
    	let div16;
    	let div13;
    	let a26;
    	let img1;
    	let img1_src_value;
    	let t64;
    	let div15;
    	let a27;
    	let t66;
    	let div14;
    	let t68;
    	let div22;
    	let div21;
    	let div18;
    	let a28;
    	let img2;
    	let img2_src_value;
    	let t69;
    	let div20;
    	let a29;
    	let t71;
    	let div19;
    	let t73;
    	let div27;
    	let div26;
    	let div23;
    	let a30;
    	let img3;
    	let img3_src_value;
    	let t74;
    	let div25;
    	let a31;
    	let t76;
    	let div24;
    	let t78;
    	let div32;
    	let div31;
    	let div28;
    	let a32;
    	let img4;
    	let img4_src_value;
    	let t79;
    	let div30;
    	let a33;
    	let t81;
    	let div29;
    	let t83;
    	let div37;
    	let div36;
    	let div33;
    	let a34;
    	let img5;
    	let img5_src_value;
    	let t84;
    	let div35;
    	let a35;
    	let t86;
    	let div34;
    	let t88;
    	let div40;
    	let a36;
    	let t90;
    	let a37;
    	let t92;
    	let div72;
    	let div71;
    	let div45;
    	let div44;
    	let div41;
    	let a38;
    	let img6;
    	let img6_src_value;
    	let t93;
    	let div43;
    	let a39;
    	let t95;
    	let div42;
    	let t97;
    	let div50;
    	let div49;
    	let div46;
    	let a40;
    	let img7;
    	let img7_src_value;
    	let t98;
    	let div48;
    	let a41;
    	let t100;
    	let div47;
    	let t102;
    	let div55;
    	let div54;
    	let div51;
    	let a42;
    	let img8;
    	let img8_src_value;
    	let t103;
    	let div53;
    	let a43;
    	let t105;
    	let div52;
    	let t107;
    	let div60;
    	let div59;
    	let div56;
    	let a44;
    	let img9;
    	let img9_src_value;
    	let t108;
    	let div58;
    	let a45;
    	let t110;
    	let div57;
    	let t112;
    	let div65;
    	let div64;
    	let div61;
    	let a46;
    	let img10;
    	let img10_src_value;
    	let t113;
    	let div63;
    	let a47;
    	let t115;
    	let div62;
    	let t117;
    	let div70;
    	let div69;
    	let div66;
    	let a48;
    	let img11;
    	let img11_src_value;
    	let t118;
    	let div68;
    	let a49;
    	let t120;
    	let div67;
    	let t122;
    	let div73;
    	let a50;
    	let t124;
    	let a51;
    	let t126;
    	let div105;
    	let div104;
    	let div78;
    	let div77;
    	let div74;
    	let a52;
    	let img12;
    	let img12_src_value;
    	let t127;
    	let div76;
    	let a53;
    	let t129;
    	let div75;
    	let t131;
    	let div83;
    	let div82;
    	let div79;
    	let a54;
    	let img13;
    	let img13_src_value;
    	let t132;
    	let div81;
    	let a55;
    	let t134;
    	let div80;
    	let t136;
    	let div88;
    	let div87;
    	let div84;
    	let a56;
    	let img14;
    	let img14_src_value;
    	let t137;
    	let div86;
    	let a57;
    	let t139;
    	let div85;
    	let t141;
    	let div93;
    	let div92;
    	let div89;
    	let a58;
    	let img15;
    	let img15_src_value;
    	let t142;
    	let div91;
    	let a59;
    	let t144;
    	let div90;
    	let t146;
    	let div98;
    	let div97;
    	let div94;
    	let a60;
    	let img16;
    	let img16_src_value;
    	let t147;
    	let div96;
    	let a61;
    	let t149;
    	let div95;
    	let t151;
    	let div103;
    	let div102;
    	let div99;
    	let a62;
    	let img17;
    	let img17_src_value;
    	let t152;
    	let div101;
    	let a63;
    	let t154;
    	let div100;
    	let t156;
    	let div110;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div111 = element("div");
    			div109 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Home";
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Search";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "Your Library";
    			t8 = space();
    			ul2 = element("ul");
    			li5 = element("li");
    			a3 = element("a");
    			h1 = element("h1");
    			h1.textContent = "Playlists";
    			t10 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t11 = space();
    			span3 = element("span");
    			span3.textContent = "Create Playlist";
    			t13 = space();
    			li4 = element("li");
    			a5 = element("a");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t14 = space();
    			span4 = element("span");
    			span4.textContent = "Liked Songs";
    			t16 = space();
    			hr = element("hr");
    			t17 = space();
    			div1 = element("div");
    			ul3 = element("ul");
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Today’s Top Hits";
    			t19 = space();
    			li7 = element("li");
    			a7 = element("a");
    			a7.textContent = "Global Top 50";
    			t21 = space();
    			li8 = element("li");
    			a8 = element("a");
    			a8.textContent = "RapCaviar";
    			t23 = space();
    			li9 = element("li");
    			a9 = element("a");
    			a9.textContent = "Viva Latino";
    			t25 = space();
    			li10 = element("li");
    			a10 = element("a");
    			a10.textContent = "Baila Reggaeton";
    			t27 = space();
    			li11 = element("li");
    			a11 = element("a");
    			a11.textContent = "Songs to Sing in the Car";
    			t29 = space();
    			li12 = element("li");
    			a12 = element("a");
    			a12.textContent = "Songs to Sing in the Shower";
    			t31 = space();
    			li13 = element("li");
    			a13 = element("a");
    			a13.textContent = "All Out 00s";
    			t33 = space();
    			li14 = element("li");
    			a14 = element("a");
    			a14.textContent = "Rock Classics";
    			t35 = space();
    			li15 = element("li");
    			a15 = element("a");
    			a15.textContent = "All Out 80s";
    			t37 = space();
    			li16 = element("li");
    			a16 = element("a");
    			a16.textContent = "Beast Mode";
    			t39 = space();
    			li17 = element("li");
    			a17 = element("a");
    			a17.textContent = "All Out 90s";
    			t41 = space();
    			li18 = element("li");
    			a18 = element("a");
    			a18.textContent = "Chill Hits";
    			t43 = space();
    			li19 = element("li");
    			a19 = element("a");
    			a19.textContent = "Peaceful Piano";
    			t45 = space();
    			div2 = element("div");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t46 = space();
    			a20 = element("a");
    			a20.textContent = "Install App";
    			t48 = space();
    			div108 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			t49 = space();
    			button1 = element("button");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			t50 = space();
    			div5 = element("div");
    			button2 = element("button");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			t51 = space();
    			a21 = element("a");
    			a21.textContent = "xAtomicYT";
    			t53 = space();
    			button3 = element("button");
    			svg9 = svg_element("svg");
    			path9 = svg_element("path");
    			t54 = space();
    			div107 = element("div");
    			div106 = element("div");
    			div7 = element("div");
    			a22 = element("a");
    			a22.textContent = "Shortcuts";
    			t56 = space();
    			a23 = element("a");
    			a23.textContent = "See All";
    			t58 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div8 = element("div");
    			a24 = element("a");
    			img0 = element("img");
    			t59 = space();
    			div10 = element("div");
    			a25 = element("a");
    			a25.textContent = "Sad Songs";
    			t61 = space();
    			div9 = element("div");
    			div9.textContent = "I cry to this";
    			t63 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div13 = element("div");
    			a26 = element("a");
    			img1 = element("img");
    			t64 = space();
    			div15 = element("div");
    			a27 = element("a");
    			a27.textContent = "Blond";
    			t66 = space();
    			div14 = element("div");
    			div14.textContent = "Frank Ocean";
    			t68 = space();
    			div22 = element("div");
    			div21 = element("div");
    			div18 = element("div");
    			a28 = element("a");
    			img2 = element("img");
    			t69 = space();
    			div20 = element("div");
    			a29 = element("a");
    			a29.textContent = "Fine Line";
    			t71 = space();
    			div19 = element("div");
    			div19.textContent = "Harry Styles";
    			t73 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div23 = element("div");
    			a30 = element("a");
    			img3 = element("img");
    			t74 = space();
    			div25 = element("div");
    			a31 = element("a");
    			a31.textContent = "DJ Khaled";
    			t76 = space();
    			div24 = element("div");
    			div24.textContent = "Artist";
    			t78 = space();
    			div32 = element("div");
    			div31 = element("div");
    			div28 = element("div");
    			a32 = element("a");
    			img4 = element("img");
    			t79 = space();
    			div30 = element("div");
    			a33 = element("a");
    			a33.textContent = "Wish You Were Here";
    			t81 = space();
    			div29 = element("div");
    			div29.textContent = "Pink Floyd";
    			t83 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div33 = element("div");
    			a34 = element("a");
    			img5 = element("img");
    			t84 = space();
    			div35 = element("div");
    			a35 = element("a");
    			a35.textContent = "AM";
    			t86 = space();
    			div34 = element("div");
    			div34.textContent = "Arctic Monkeys";
    			t88 = space();
    			div40 = element("div");
    			a36 = element("a");
    			a36.textContent = "Recently played";
    			t90 = space();
    			a37 = element("a");
    			a37.textContent = "See All";
    			t92 = space();
    			div72 = element("div");
    			div71 = element("div");
    			div45 = element("div");
    			div44 = element("div");
    			div41 = element("div");
    			a38 = element("a");
    			img6 = element("img");
    			t93 = space();
    			div43 = element("div");
    			a39 = element("a");
    			a39.textContent = "Sad Songs";
    			t95 = space();
    			div42 = element("div");
    			div42.textContent = "I cry to this";
    			t97 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div46 = element("div");
    			a40 = element("a");
    			img7 = element("img");
    			t98 = space();
    			div48 = element("div");
    			a41 = element("a");
    			a41.textContent = "Blond";
    			t100 = space();
    			div47 = element("div");
    			div47.textContent = "Frank Ocean";
    			t102 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div51 = element("div");
    			a42 = element("a");
    			img8 = element("img");
    			t103 = space();
    			div53 = element("div");
    			a43 = element("a");
    			a43.textContent = "Fine Line";
    			t105 = space();
    			div52 = element("div");
    			div52.textContent = "Harry Styles";
    			t107 = space();
    			div60 = element("div");
    			div59 = element("div");
    			div56 = element("div");
    			a44 = element("a");
    			img9 = element("img");
    			t108 = space();
    			div58 = element("div");
    			a45 = element("a");
    			a45.textContent = "DJ Khaled";
    			t110 = space();
    			div57 = element("div");
    			div57.textContent = "Artist";
    			t112 = space();
    			div65 = element("div");
    			div64 = element("div");
    			div61 = element("div");
    			a46 = element("a");
    			img10 = element("img");
    			t113 = space();
    			div63 = element("div");
    			a47 = element("a");
    			a47.textContent = "Wish You Were Here";
    			t115 = space();
    			div62 = element("div");
    			div62.textContent = "Pink Floyd";
    			t117 = space();
    			div70 = element("div");
    			div69 = element("div");
    			div66 = element("div");
    			a48 = element("a");
    			img11 = element("img");
    			t118 = space();
    			div68 = element("div");
    			a49 = element("a");
    			a49.textContent = "AM";
    			t120 = space();
    			div67 = element("div");
    			div67.textContent = "Arctic Monkeys";
    			t122 = space();
    			div73 = element("div");
    			a50 = element("a");
    			a50.textContent = "Jump back in";
    			t124 = space();
    			a51 = element("a");
    			a51.textContent = "See All";
    			t126 = space();
    			div105 = element("div");
    			div104 = element("div");
    			div78 = element("div");
    			div77 = element("div");
    			div74 = element("div");
    			a52 = element("a");
    			img12 = element("img");
    			t127 = space();
    			div76 = element("div");
    			a53 = element("a");
    			a53.textContent = "Sad Songs";
    			t129 = space();
    			div75 = element("div");
    			div75.textContent = "I cry to this";
    			t131 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div79 = element("div");
    			a54 = element("a");
    			img13 = element("img");
    			t132 = space();
    			div81 = element("div");
    			a55 = element("a");
    			a55.textContent = "Blond";
    			t134 = space();
    			div80 = element("div");
    			div80.textContent = "Frank Ocean";
    			t136 = space();
    			div88 = element("div");
    			div87 = element("div");
    			div84 = element("div");
    			a56 = element("a");
    			img14 = element("img");
    			t137 = space();
    			div86 = element("div");
    			a57 = element("a");
    			a57.textContent = "Fine Line";
    			t139 = space();
    			div85 = element("div");
    			div85.textContent = "Harry Styles";
    			t141 = space();
    			div93 = element("div");
    			div92 = element("div");
    			div89 = element("div");
    			a58 = element("a");
    			img15 = element("img");
    			t142 = space();
    			div91 = element("div");
    			a59 = element("a");
    			a59.textContent = "DJ Khaled";
    			t144 = space();
    			div90 = element("div");
    			div90.textContent = "Artist";
    			t146 = space();
    			div98 = element("div");
    			div97 = element("div");
    			div94 = element("div");
    			a60 = element("a");
    			img16 = element("img");
    			t147 = space();
    			div96 = element("div");
    			a61 = element("a");
    			a61.textContent = "Wish You Were Here";
    			t149 = space();
    			div95 = element("div");
    			div95.textContent = "Pink Floyd";
    			t151 = space();
    			div103 = element("div");
    			div102 = element("div");
    			div99 = element("div");
    			a62 = element("a");
    			img17 = element("img");
    			t152 = space();
    			div101 = element("div");
    			a63 = element("a");
    			a63.textContent = "AM";
    			t154 = space();
    			div100 = element("div");
    			div100.textContent = "Arctic Monkeys";
    			t156 = space();
    			div110 = element("div");
    			div110.textContent = "Bottom";
    			attr_dev(path0, "d", "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z");
    			attr_dev(path0, "class", "svelte-53oag5");
    			add_location(path0, file, 11, 168, 598);
    			attr_dev(svg0, "class", "group-hover:text-white  svelte-53oag5");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			add_location(svg0, file, 11, 32, 462);
    			attr_dev(span0, "class", "ml-3 group-hover:text-white svelte-53oag5");
    			add_location(span0, file, 12, 32, 842);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "flex items-center mx-4 mt-4 group   svelte-53oag5");
    			add_location(a0, file, 10, 28, 372);
    			attr_dev(li0, "class", "svelte-53oag5");
    			add_location(li0, file, 9, 24, 338);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "class", "svelte-53oag5");
    			add_location(path1, file, 16, 168, 1218);
    			attr_dev(svg1, "class", "group-hover:text-white  svelte-53oag5");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			add_location(svg1, file, 16, 32, 1082);
    			attr_dev(span1, "class", "group-hover:text-white ml-3 svelte-53oag5");
    			add_location(span1, file, 17, 32, 1422);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "flex items-center mx-4 mt-4 group svelte-53oag5");
    			add_location(a1, file, 15, 28, 994);
    			attr_dev(li1, "class", "svelte-53oag5");
    			add_location(li1, file, 14, 24, 960);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "d", "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "class", "svelte-53oag5");
    			add_location(path2, file, 22, 168, 1826);
    			attr_dev(svg2, "class", "group-hover:text-white  svelte-53oag5");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "currentColor");
    			attr_dev(svg2, "viewBox", "0 0 20 20");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			add_location(svg2, file, 22, 32, 1690);
    			attr_dev(span2, "class", " group-hover:text-white ml-3 svelte-53oag5");
    			add_location(span2, file, 23, 32, 2106);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "flex items-center mx-4 mt-4 group svelte-53oag5");
    			add_location(a2, file, 21, 28, 1602);
    			attr_dev(li2, "class", "svelte-53oag5");
    			add_location(li2, file, 20, 24, 1568);
    			attr_dev(ul0, "class", "py-6 font-bold ml-2 playlists svelte-53oag5");
    			add_location(ul0, file, 8, 20, 270);
    			attr_dev(h1, "class", "uppercase svelte-53oag5");
    			add_location(h1, file, 30, 32, 2442);
    			attr_dev(a3, "class", "flex items-center mx-4 mt-4 svelte-53oag5");
    			add_location(a3, file, 29, 28, 2369);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "d", "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z");
    			attr_dev(path3, "clip-rule", "evenodd");
    			attr_dev(path3, "class", "svelte-53oag5");
    			add_location(path3, file, 35, 175, 2871);
    			attr_dev(svg3, "class", "group-hover:text-white svelte-53oag5");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "fill", "currentColor");
    			attr_dev(svg3, "viewBox", "0 0 20 20");
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "24");
    			add_location(svg3, file, 35, 40, 2736);
    			attr_dev(span3, "class", "group-hover:text-white ml-4 svelte-53oag5");
    			add_location(span3, file, 36, 40, 3056);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "flex items-center mx-4 mt-4 group svelte-53oag5");
    			add_location(a4, file, 34, 36, 2640);
    			attr_dev(li3, "class", "svelte-53oag5");
    			add_location(li3, file, 33, 32, 2598);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "d", "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "class", "svelte-53oag5");
    			add_location(path4, file, 41, 175, 3508);
    			attr_dev(svg4, "class", "group-hover:text-white svelte-53oag5");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "fill", "currentColor");
    			attr_dev(svg4, "viewBox", "0 0 20 20");
    			attr_dev(svg4, "width", "24");
    			attr_dev(svg4, "height", "24");
    			add_location(svg4, file, 41, 40, 3373);
    			attr_dev(span4, "class", "group-hover:text-white ml-4 svelte-53oag5");
    			add_location(span4, file, 42, 40, 3717);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "flex items-center mx-4 mt-4 group svelte-53oag5");
    			add_location(a5, file, 40, 36, 3277);
    			attr_dev(li4, "class", "svelte-53oag5");
    			add_location(li4, file, 39, 32, 3235);
    			attr_dev(ul1, "class", "font-bold svelte-53oag5");
    			add_location(ul1, file, 32, 28, 2542);
    			attr_dev(li5, "class", "svelte-53oag5");
    			add_location(li5, file, 28, 24, 2335);
    			attr_dev(ul2, "class", "ml-2 playlists svelte-53oag5");
    			add_location(ul2, file, 27, 20, 2282);
    			attr_dev(hr, "class", "divider mt-4 m-auto svelte-53oag5");
    			add_location(hr, file, 49, 20, 3975);
    			attr_dev(div0, "class", "svelte-53oag5");
    			add_location(div0, file, 7, 16, 243);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a6, file, 53, 45, 4205);
    			attr_dev(li6, "class", "truncate svelte-53oag5");
    			add_location(li6, file, 53, 24, 4184);
    			attr_dev(a7, "href", "#");
    			attr_dev(a7, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a7, file, 54, 45, 4326);
    			attr_dev(li7, "class", "truncate svelte-53oag5");
    			add_location(li7, file, 54, 24, 4305);
    			attr_dev(a8, "href", "#");
    			attr_dev(a8, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a8, file, 55, 45, 4444);
    			attr_dev(li8, "class", "truncate svelte-53oag5");
    			add_location(li8, file, 55, 24, 4423);
    			attr_dev(a9, "href", "#");
    			attr_dev(a9, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a9, file, 56, 45, 4558);
    			attr_dev(li9, "class", "truncate svelte-53oag5");
    			add_location(li9, file, 56, 24, 4537);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a10, file, 57, 45, 4674);
    			attr_dev(li10, "class", "truncate svelte-53oag5");
    			add_location(li10, file, 57, 24, 4653);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a11, file, 58, 45, 4794);
    			attr_dev(li11, "class", "truncate svelte-53oag5");
    			add_location(li11, file, 58, 24, 4773);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a12, file, 59, 45, 4923);
    			attr_dev(li12, "class", "truncate svelte-53oag5");
    			add_location(li12, file, 59, 24, 4902);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a13, file, 60, 45, 5055);
    			attr_dev(li13, "class", "truncate svelte-53oag5");
    			add_location(li13, file, 60, 24, 5034);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a14, file, 61, 45, 5171);
    			attr_dev(li14, "class", "truncate svelte-53oag5");
    			add_location(li14, file, 61, 24, 5150);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a15, file, 62, 45, 5289);
    			attr_dev(li15, "class", "truncate svelte-53oag5");
    			add_location(li15, file, 62, 24, 5268);
    			attr_dev(a16, "href", "#");
    			attr_dev(a16, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a16, file, 63, 45, 5405);
    			attr_dev(li16, "class", "truncate svelte-53oag5");
    			add_location(li16, file, 63, 24, 5384);
    			attr_dev(a17, "href", "#");
    			attr_dev(a17, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a17, file, 64, 45, 5520);
    			attr_dev(li17, "class", "truncate svelte-53oag5");
    			add_location(li17, file, 64, 24, 5499);
    			attr_dev(a18, "href", "#");
    			attr_dev(a18, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a18, file, 65, 45, 5636);
    			attr_dev(li18, "class", "truncate svelte-53oag5");
    			add_location(li18, file, 65, 24, 5615);
    			attr_dev(a19, "href", "#");
    			attr_dev(a19, "class", "hover:text-white font-normal svelte-53oag5");
    			add_location(a19, file, 66, 45, 5751);
    			attr_dev(li19, "class", "truncate svelte-53oag5");
    			add_location(li19, file, 66, 24, 5730);
    			attr_dev(ul3, "class", "leading-loose playlists svelte-53oag5");
    			add_location(ul3, file, 52, 20, 4122);
    			attr_dev(div1, "class", "scroll overflow-y-auto px-5 mt-4 ml-1 svelte-53oag5");
    			add_location(div1, file, 51, 16, 4049);
    			attr_dev(path5, "stroke-linecap", "round");
    			attr_dev(path5, "stroke-linejoin", "round");
    			attr_dev(path5, "stroke-width", "2");
    			attr_dev(path5, "d", "M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z");
    			attr_dev(path5, "class", "svelte-53oag5");
    			add_location(path5, file, 70, 180, 6139);
    			attr_dev(svg5, "class", "icon-color group-hover:text-white svelte-53oag5");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "width", "24");
    			attr_dev(svg5, "height", "24");
    			add_location(svg5, file, 70, 20, 5979);
    			attr_dev(a20, "href", "#");
    			attr_dev(a20, "class", "playlists ml-1 group-hover:text-white svelte-53oag5");
    			add_location(a20, file, 71, 20, 6301);
    			attr_dev(div2, "class", "bottom h-16 px-4 py-1 flex items-center group ml-2  svelte-53oag5");
    			add_location(div2, file, 69, 16, 5892);
    			attr_dev(div3, "class", "sideBar flex-none text-white justify-between flex flex-col font-semibold svelte-53oag5");
    			add_location(div3, file, 6, 12, 139);
    			attr_dev(path6, "fill-rule", "evenodd");
    			attr_dev(path6, "d", "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z");
    			attr_dev(path6, "clip-rule", "evenodd");
    			attr_dev(path6, "class", "svelte-53oag5");
    			add_location(path6, file, 78, 168, 6837);
    			attr_dev(svg6, "class", "icon-color hover:text-white svelte-53oag5");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg6, "fill", "currentColor");
    			attr_dev(svg6, "viewBox", "0 0 20 20");
    			attr_dev(svg6, "width", "34");
    			attr_dev(svg6, "height", "34");
    			add_location(svg6, file, 78, 28, 6697);
    			attr_dev(button0, "class", "bg-black rounded-full svelte-53oag5");
    			add_location(button0, file, 77, 24, 6629);
    			attr_dev(path7, "fill-rule", "evenodd");
    			attr_dev(path7, "d", "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z");
    			attr_dev(path7, "clip-rule", "evenodd");
    			attr_dev(path7, "class", "svelte-53oag5");
    			add_location(path7, file, 81, 168, 7278);
    			attr_dev(svg7, "class", "icon-color hover:text-white svelte-53oag5");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg7, "fill", "currentColor");
    			attr_dev(svg7, "viewBox", "0 0 20 20");
    			attr_dev(svg7, "width", "34");
    			attr_dev(svg7, "height", "34");
    			add_location(svg7, file, 81, 28, 7138);
    			attr_dev(button1, "class", "bg-black rounded-full svelte-53oag5");
    			add_location(button1, file, 80, 24, 7069);
    			attr_dev(div4, "class", "py-2 svelte-53oag5");
    			add_location(div4, file, 76, 20, 6585);
    			attr_dev(path8, "fill-rule", "evenodd");
    			attr_dev(path8, "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z");
    			attr_dev(path8, "clip-rule", "evenodd");
    			attr_dev(path8, "class", "svelte-53oag5");
    			add_location(path8, file, 86, 131, 7762);
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg8, "fill", "currentColor");
    			attr_dev(svg8, "viewBox", "0 0 20 20");
    			attr_dev(svg8, "width", "34");
    			attr_dev(svg8, "height", "34");
    			attr_dev(svg8, "class", "svelte-53oag5");
    			add_location(svg8, file, 86, 28, 7659);
    			attr_dev(button2, "class", "svelte-53oag5");
    			add_location(button2, file, 85, 24, 7621);
    			attr_dev(a21, "href", "#");
    			attr_dev(a21, "class", "ml-2 svelte-53oag5");
    			add_location(a21, file, 88, 24, 8037);
    			attr_dev(path9, "fill-rule", "evenodd");
    			attr_dev(path9, "d", "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z");
    			attr_dev(path9, "clip-rule", "evenodd");
    			attr_dev(path9, "class", "svelte-53oag5");
    			add_location(path9, file, 90, 131, 8242);
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg9, "fill", "currentColor");
    			attr_dev(svg9, "viewBox", "0 0 20 20");
    			attr_dev(svg9, "width", "34");
    			attr_dev(svg9, "height", "34");
    			attr_dev(svg9, "class", "svelte-53oag5");
    			add_location(svg9, file, 90, 28, 8139);
    			attr_dev(button3, "class", "svelte-53oag5");
    			add_location(button3, file, 89, 24, 8101);
    			attr_dev(div5, "class", "flex items-center group bg-black rounded-full  svelte-53oag5");
    			add_location(div5, file, 84, 20, 7535);
    			attr_dev(div6, "class", "flex items-center justify-between px-8 py-2 svelte-53oag5");
    			add_location(div6, file, 75, 16, 6506);
    			attr_dev(a22, "href", "#");
    			attr_dev(a22, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-53oag5");
    			add_location(a22, file, 99, 28, 8703);
    			attr_dev(a23, "href", "#");
    			attr_dev(a23, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-53oag5");
    			add_location(a23, file, 100, 28, 8842);
    			attr_dev(div7, "class", "flex justify-between inline-block pt-2 svelte-53oag5");
    			add_location(div7, file, 98, 24, 8621);
    			attr_dev(img0, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img0.src !== (img0_src_value = "covers/cover0.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "cover");
    			add_location(img0, file, 108, 57, 9431);
    			attr_dev(a24, "href", "#");
    			attr_dev(a24, "class", "svelte-53oag5");
    			add_location(a24, file, 108, 44, 9418);
    			attr_dev(div8, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div8, file, 107, 40, 9337);
    			attr_dev(a25, "href", "#");
    			attr_dev(a25, "class", "font-bold svelte-53oag5");
    			add_location(a25, file, 111, 44, 9667);
    			attr_dev(div9, "class", "playlists svelte-53oag5");
    			add_location(div9, file, 112, 44, 9756);
    			attr_dev(div10, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div10, file, 110, 40, 9596);
    			attr_dev(div11, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div11, file, 106, 36, 9256);
    			attr_dev(div12, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div12, file, 105, 32, 9146);
    			attr_dev(img1, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img1.src !== (img1_src_value = "covers/cover1.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "cover");
    			add_location(img1, file, 120, 57, 10251);
    			attr_dev(a26, "href", "#");
    			attr_dev(a26, "class", "svelte-53oag5");
    			add_location(a26, file, 120, 44, 10238);
    			attr_dev(div13, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div13, file, 119, 40, 10157);
    			attr_dev(a27, "href", "#");
    			attr_dev(a27, "class", "font-bold svelte-53oag5");
    			add_location(a27, file, 123, 44, 10487);
    			attr_dev(div14, "class", "playlists svelte-53oag5");
    			add_location(div14, file, 124, 44, 10572);
    			attr_dev(div15, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div15, file, 122, 40, 10416);
    			attr_dev(div16, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div16, file, 118, 36, 10076);
    			attr_dev(div17, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div17, file, 117, 32, 9966);
    			attr_dev(img2, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img2.src !== (img2_src_value = "covers/cover2.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "cover");
    			add_location(img2, file, 132, 57, 11065);
    			attr_dev(a28, "href", "#");
    			attr_dev(a28, "class", "svelte-53oag5");
    			add_location(a28, file, 132, 44, 11052);
    			attr_dev(div18, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div18, file, 131, 40, 10971);
    			attr_dev(a29, "href", "#");
    			attr_dev(a29, "class", "font-bold svelte-53oag5");
    			add_location(a29, file, 135, 44, 11301);
    			attr_dev(div19, "class", "playlists svelte-53oag5");
    			add_location(div19, file, 136, 44, 11390);
    			attr_dev(div20, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div20, file, 134, 40, 11230);
    			attr_dev(div21, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div21, file, 130, 36, 10890);
    			attr_dev(div22, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div22, file, 129, 32, 10780);
    			attr_dev(img3, "class", " rounded-full shadow-md svelte-53oag5");
    			if (img3.src !== (img3_src_value = "covers/artist0.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "cover");
    			add_location(img3, file, 144, 57, 11884);
    			attr_dev(a30, "href", "#");
    			attr_dev(a30, "class", "svelte-53oag5");
    			add_location(a30, file, 144, 44, 11871);
    			attr_dev(div23, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div23, file, 143, 40, 11790);
    			attr_dev(a31, "href", "#");
    			attr_dev(a31, "class", "font-bold svelte-53oag5");
    			add_location(a31, file, 147, 44, 12123);
    			attr_dev(div24, "class", "playlists svelte-53oag5");
    			add_location(div24, file, 148, 44, 12212);
    			attr_dev(div25, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div25, file, 146, 40, 12052);
    			attr_dev(div26, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div26, file, 142, 36, 11709);
    			attr_dev(div27, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div27, file, 141, 32, 11599);
    			attr_dev(img4, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img4.src !== (img4_src_value = "covers/cover3.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "cover");
    			add_location(img4, file, 156, 57, 12700);
    			attr_dev(a32, "href", "#");
    			attr_dev(a32, "class", "svelte-53oag5");
    			add_location(a32, file, 156, 44, 12687);
    			attr_dev(div28, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div28, file, 155, 40, 12606);
    			attr_dev(a33, "href", "#");
    			attr_dev(a33, "class", "font-bold svelte-53oag5");
    			add_location(a33, file, 159, 44, 12936);
    			attr_dev(div29, "class", "playlists svelte-53oag5");
    			add_location(div29, file, 160, 44, 13034);
    			attr_dev(div30, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div30, file, 158, 40, 12865);
    			attr_dev(div31, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div31, file, 154, 36, 12525);
    			attr_dev(div32, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div32, file, 153, 32, 12415);
    			attr_dev(img5, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img5.src !== (img5_src_value = "covers/cover4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "cover");
    			add_location(img5, file, 168, 57, 13526);
    			attr_dev(a34, "href", "#");
    			attr_dev(a34, "class", "svelte-53oag5");
    			add_location(a34, file, 168, 44, 13513);
    			attr_dev(div33, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div33, file, 167, 40, 13432);
    			attr_dev(a35, "href", "#");
    			attr_dev(a35, "class", "font-bold svelte-53oag5");
    			add_location(a35, file, 171, 44, 13762);
    			attr_dev(div34, "class", "playlists svelte-53oag5");
    			add_location(div34, file, 172, 44, 13844);
    			attr_dev(div35, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div35, file, 170, 40, 13691);
    			attr_dev(div36, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div36, file, 166, 36, 13351);
    			attr_dev(div37, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div37, file, 165, 32, 13241);
    			attr_dev(div38, "class", "flex flex-wrap items-center mt-4 svelte-53oag5");
    			add_location(div38, file, 103, 28, 9064);
    			attr_dev(div39, "class", "ml-4 svelte-53oag5");
    			add_location(div39, file, 102, 24, 9016);
    			attr_dev(a36, "href", "#");
    			attr_dev(a36, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-53oag5");
    			add_location(a36, file, 181, 28, 14204);
    			attr_dev(a37, "href", "#");
    			attr_dev(a37, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-53oag5");
    			add_location(a37, file, 182, 28, 14349);
    			attr_dev(div40, "class", "flex justify-between inline-block pt-2 mt-6 svelte-53oag5");
    			add_location(div40, file, 180, 24, 14117);
    			attr_dev(img6, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img6.src !== (img6_src_value = "covers/cover0.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "cover");
    			add_location(img6, file, 190, 57, 14938);
    			attr_dev(a38, "href", "#");
    			attr_dev(a38, "class", "svelte-53oag5");
    			add_location(a38, file, 190, 44, 14925);
    			attr_dev(div41, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div41, file, 189, 40, 14844);
    			attr_dev(a39, "href", "#");
    			attr_dev(a39, "class", "font-bold svelte-53oag5");
    			add_location(a39, file, 193, 44, 15174);
    			attr_dev(div42, "class", "playlists svelte-53oag5");
    			add_location(div42, file, 194, 44, 15263);
    			attr_dev(div43, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div43, file, 192, 40, 15103);
    			attr_dev(div44, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div44, file, 188, 36, 14763);
    			attr_dev(div45, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div45, file, 187, 32, 14653);
    			attr_dev(img7, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img7.src !== (img7_src_value = "covers/cover1.jpg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "cover");
    			add_location(img7, file, 202, 57, 15758);
    			attr_dev(a40, "href", "#");
    			attr_dev(a40, "class", "svelte-53oag5");
    			add_location(a40, file, 202, 44, 15745);
    			attr_dev(div46, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div46, file, 201, 40, 15664);
    			attr_dev(a41, "href", "#");
    			attr_dev(a41, "class", "font-bold svelte-53oag5");
    			add_location(a41, file, 205, 44, 15994);
    			attr_dev(div47, "class", "playlists svelte-53oag5");
    			add_location(div47, file, 206, 44, 16079);
    			attr_dev(div48, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div48, file, 204, 40, 15923);
    			attr_dev(div49, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div49, file, 200, 36, 15583);
    			attr_dev(div50, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div50, file, 199, 32, 15473);
    			attr_dev(img8, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img8.src !== (img8_src_value = "covers/cover2.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "cover");
    			add_location(img8, file, 214, 57, 16572);
    			attr_dev(a42, "href", "#");
    			attr_dev(a42, "class", "svelte-53oag5");
    			add_location(a42, file, 214, 44, 16559);
    			attr_dev(div51, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div51, file, 213, 40, 16478);
    			attr_dev(a43, "href", "#");
    			attr_dev(a43, "class", "font-bold svelte-53oag5");
    			add_location(a43, file, 217, 44, 16808);
    			attr_dev(div52, "class", "playlists svelte-53oag5");
    			add_location(div52, file, 218, 44, 16897);
    			attr_dev(div53, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div53, file, 216, 40, 16737);
    			attr_dev(div54, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div54, file, 212, 36, 16397);
    			attr_dev(div55, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div55, file, 211, 32, 16287);
    			attr_dev(img9, "class", " rounded-full shadow-md svelte-53oag5");
    			if (img9.src !== (img9_src_value = "covers/artist0.jpg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "cover");
    			add_location(img9, file, 226, 57, 17391);
    			attr_dev(a44, "href", "#");
    			attr_dev(a44, "class", "svelte-53oag5");
    			add_location(a44, file, 226, 44, 17378);
    			attr_dev(div56, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div56, file, 225, 40, 17297);
    			attr_dev(a45, "href", "#");
    			attr_dev(a45, "class", "font-bold svelte-53oag5");
    			add_location(a45, file, 229, 44, 17630);
    			attr_dev(div57, "class", "playlists svelte-53oag5");
    			add_location(div57, file, 230, 44, 17719);
    			attr_dev(div58, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div58, file, 228, 40, 17559);
    			attr_dev(div59, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div59, file, 224, 36, 17216);
    			attr_dev(div60, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div60, file, 223, 32, 17106);
    			attr_dev(img10, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img10.src !== (img10_src_value = "covers/cover3.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "cover");
    			add_location(img10, file, 238, 57, 18207);
    			attr_dev(a46, "href", "#");
    			attr_dev(a46, "class", "svelte-53oag5");
    			add_location(a46, file, 238, 44, 18194);
    			attr_dev(div61, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div61, file, 237, 40, 18113);
    			attr_dev(a47, "href", "#");
    			attr_dev(a47, "class", "font-bold svelte-53oag5");
    			add_location(a47, file, 241, 44, 18443);
    			attr_dev(div62, "class", "playlists svelte-53oag5");
    			add_location(div62, file, 242, 44, 18541);
    			attr_dev(div63, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div63, file, 240, 40, 18372);
    			attr_dev(div64, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div64, file, 236, 36, 18032);
    			attr_dev(div65, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div65, file, 235, 32, 17922);
    			attr_dev(img11, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img11.src !== (img11_src_value = "covers/cover4.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "cover");
    			add_location(img11, file, 250, 57, 19033);
    			attr_dev(a48, "href", "#");
    			attr_dev(a48, "class", "svelte-53oag5");
    			add_location(a48, file, 250, 44, 19020);
    			attr_dev(div66, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div66, file, 249, 40, 18939);
    			attr_dev(a49, "href", "#");
    			attr_dev(a49, "class", "font-bold svelte-53oag5");
    			add_location(a49, file, 253, 44, 19269);
    			attr_dev(div67, "class", "playlists svelte-53oag5");
    			add_location(div67, file, 254, 44, 19351);
    			attr_dev(div68, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div68, file, 252, 40, 19198);
    			attr_dev(div69, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div69, file, 248, 36, 18858);
    			attr_dev(div70, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div70, file, 247, 32, 18748);
    			attr_dev(div71, "class", "flex flex-wrap items-center mt-4 svelte-53oag5");
    			add_location(div71, file, 185, 28, 14571);
    			attr_dev(div72, "class", "ml-4 svelte-53oag5");
    			add_location(div72, file, 184, 24, 14523);
    			attr_dev(a50, "href", "#");
    			attr_dev(a50, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-53oag5");
    			add_location(a50, file, 263, 28, 19711);
    			attr_dev(a51, "href", "#");
    			attr_dev(a51, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-53oag5");
    			add_location(a51, file, 264, 28, 19853);
    			attr_dev(div73, "class", "flex justify-between inline-block pt-2 mt-6 svelte-53oag5");
    			add_location(div73, file, 262, 24, 19624);
    			attr_dev(img12, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img12.src !== (img12_src_value = "covers/cover0.jpg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "cover");
    			add_location(img12, file, 272, 57, 20442);
    			attr_dev(a52, "href", "#");
    			attr_dev(a52, "class", "svelte-53oag5");
    			add_location(a52, file, 272, 44, 20429);
    			attr_dev(div74, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div74, file, 271, 40, 20348);
    			attr_dev(a53, "href", "#");
    			attr_dev(a53, "class", "font-bold svelte-53oag5");
    			add_location(a53, file, 275, 44, 20678);
    			attr_dev(div75, "class", "playlists svelte-53oag5");
    			add_location(div75, file, 276, 44, 20767);
    			attr_dev(div76, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div76, file, 274, 40, 20607);
    			attr_dev(div77, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div77, file, 270, 36, 20267);
    			attr_dev(div78, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div78, file, 269, 32, 20157);
    			attr_dev(img13, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img13.src !== (img13_src_value = "covers/cover1.jpg")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "cover");
    			add_location(img13, file, 284, 57, 21262);
    			attr_dev(a54, "href", "#");
    			attr_dev(a54, "class", "svelte-53oag5");
    			add_location(a54, file, 284, 44, 21249);
    			attr_dev(div79, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div79, file, 283, 40, 21168);
    			attr_dev(a55, "href", "#");
    			attr_dev(a55, "class", "font-bold svelte-53oag5");
    			add_location(a55, file, 287, 44, 21498);
    			attr_dev(div80, "class", "playlists svelte-53oag5");
    			add_location(div80, file, 288, 44, 21583);
    			attr_dev(div81, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div81, file, 286, 40, 21427);
    			attr_dev(div82, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div82, file, 282, 36, 21087);
    			attr_dev(div83, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div83, file, 281, 32, 20977);
    			attr_dev(img14, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img14.src !== (img14_src_value = "covers/cover2.jpg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "cover");
    			add_location(img14, file, 296, 57, 22076);
    			attr_dev(a56, "href", "#");
    			attr_dev(a56, "class", "svelte-53oag5");
    			add_location(a56, file, 296, 44, 22063);
    			attr_dev(div84, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div84, file, 295, 40, 21982);
    			attr_dev(a57, "href", "#");
    			attr_dev(a57, "class", "font-bold svelte-53oag5");
    			add_location(a57, file, 299, 44, 22312);
    			attr_dev(div85, "class", "playlists svelte-53oag5");
    			add_location(div85, file, 300, 44, 22401);
    			attr_dev(div86, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div86, file, 298, 40, 22241);
    			attr_dev(div87, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div87, file, 294, 36, 21901);
    			attr_dev(div88, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div88, file, 293, 32, 21791);
    			attr_dev(img15, "class", " rounded-full shadow-md svelte-53oag5");
    			if (img15.src !== (img15_src_value = "covers/artist0.jpg")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "cover");
    			add_location(img15, file, 308, 57, 22895);
    			attr_dev(a58, "href", "#");
    			attr_dev(a58, "class", "svelte-53oag5");
    			add_location(a58, file, 308, 44, 22882);
    			attr_dev(div89, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div89, file, 307, 40, 22801);
    			attr_dev(a59, "href", "#");
    			attr_dev(a59, "class", "font-bold svelte-53oag5");
    			add_location(a59, file, 311, 44, 23134);
    			attr_dev(div90, "class", "playlists svelte-53oag5");
    			add_location(div90, file, 312, 44, 23223);
    			attr_dev(div91, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div91, file, 310, 40, 23063);
    			attr_dev(div92, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div92, file, 306, 36, 22720);
    			attr_dev(div93, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div93, file, 305, 32, 22610);
    			attr_dev(img16, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img16.src !== (img16_src_value = "covers/cover3.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "cover");
    			add_location(img16, file, 320, 57, 23711);
    			attr_dev(a60, "href", "#");
    			attr_dev(a60, "class", "svelte-53oag5");
    			add_location(a60, file, 320, 44, 23698);
    			attr_dev(div94, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div94, file, 319, 40, 23617);
    			attr_dev(a61, "href", "#");
    			attr_dev(a61, "class", "font-bold svelte-53oag5");
    			add_location(a61, file, 323, 44, 23947);
    			attr_dev(div95, "class", "playlists svelte-53oag5");
    			add_location(div95, file, 324, 44, 24045);
    			attr_dev(div96, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div96, file, 322, 40, 23876);
    			attr_dev(div97, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div97, file, 318, 36, 23536);
    			attr_dev(div98, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div98, file, 317, 32, 23426);
    			attr_dev(img17, "class", " rounded-md shadow-md svelte-53oag5");
    			if (img17.src !== (img17_src_value = "covers/cover4.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "alt", "cover");
    			add_location(img17, file, 332, 57, 24537);
    			attr_dev(a62, "href", "#");
    			attr_dev(a62, "class", "svelte-53oag5");
    			add_location(a62, file, 332, 44, 24524);
    			attr_dev(div99, "class", "rounded-lg card-image svelte-53oag5");
    			add_location(div99, file, 331, 40, 24443);
    			attr_dev(a63, "href", "#");
    			attr_dev(a63, "class", "font-bold svelte-53oag5");
    			add_location(a63, file, 335, 44, 24773);
    			attr_dev(div100, "class", "playlists svelte-53oag5");
    			add_location(div100, file, 336, 44, 24855);
    			attr_dev(div101, "class", "ml-5 pb-3  svelte-53oag5");
    			add_location(div101, file, 334, 40, 24702);
    			attr_dev(div102, "class", "card rounded-lg shadow-md svelte-53oag5");
    			add_location(div102, file, 330, 36, 24362);
    			attr_dev(div103, "class", "w-1/6 px-4 max-w-xs rounded overflow-hidden shadow-lg my-2 svelte-53oag5");
    			add_location(div103, file, 329, 32, 24252);
    			attr_dev(div104, "class", "flex flex-wrap items-center mt-4 svelte-53oag5");
    			add_location(div104, file, 267, 28, 20075);
    			attr_dev(div105, "class", "ml-4 svelte-53oag5");
    			add_location(div105, file, 266, 24, 20027);
    			attr_dev(div106, "class", "mx-auto svelte-53oag5");
    			add_location(div106, file, 97, 20, 8574);
    			attr_dev(div107, "class", "overflow-y-auto svelte-53oag5");
    			add_location(div107, file, 95, 16, 8521);
    			attr_dev(div108, "class", "mainScreen flex-1 flex flex-col text-white svelte-53oag5");
    			add_location(div108, file, 74, 12, 6432);
    			attr_dev(div109, "class", "flex flex-1 overflow-y-hidden svelte-53oag5");
    			add_location(div109, file, 5, 8, 82);
    			attr_dev(div110, "class", "bottomBar  svelte-53oag5");
    			add_location(div110, file, 349, 8, 25202);
    			attr_dev(div111, "class", "flex flex-col h-screen svelte-53oag5");
    			add_location(div111, file, 4, 4, 36);
    			attr_dev(main, "class", "svelte-53oag5");
    			add_location(main, file, 3, 0, 24);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div111);
    			append_dev(div111, div109);
    			append_dev(div109, div3);
    			append_dev(div3, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(a0, t0);
    			append_dev(a0, span0);
    			append_dev(ul0, t2);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(a1, t3);
    			append_dev(a1, span1);
    			append_dev(ul0, t5);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    			append_dev(a2, t6);
    			append_dev(a2, span2);
    			append_dev(div0, t8);
    			append_dev(div0, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, a3);
    			append_dev(a3, h1);
    			append_dev(li5, t10);
    			append_dev(li5, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(a4, svg3);
    			append_dev(svg3, path3);
    			append_dev(a4, t11);
    			append_dev(a4, span3);
    			append_dev(ul1, t13);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(a5, svg4);
    			append_dev(svg4, path4);
    			append_dev(a5, t14);
    			append_dev(a5, span4);
    			append_dev(div0, t16);
    			append_dev(div0, hr);
    			append_dev(div3, t17);
    			append_dev(div3, div1);
    			append_dev(div1, ul3);
    			append_dev(ul3, li6);
    			append_dev(li6, a6);
    			append_dev(ul3, t19);
    			append_dev(ul3, li7);
    			append_dev(li7, a7);
    			append_dev(ul3, t21);
    			append_dev(ul3, li8);
    			append_dev(li8, a8);
    			append_dev(ul3, t23);
    			append_dev(ul3, li9);
    			append_dev(li9, a9);
    			append_dev(ul3, t25);
    			append_dev(ul3, li10);
    			append_dev(li10, a10);
    			append_dev(ul3, t27);
    			append_dev(ul3, li11);
    			append_dev(li11, a11);
    			append_dev(ul3, t29);
    			append_dev(ul3, li12);
    			append_dev(li12, a12);
    			append_dev(ul3, t31);
    			append_dev(ul3, li13);
    			append_dev(li13, a13);
    			append_dev(ul3, t33);
    			append_dev(ul3, li14);
    			append_dev(li14, a14);
    			append_dev(ul3, t35);
    			append_dev(ul3, li15);
    			append_dev(li15, a15);
    			append_dev(ul3, t37);
    			append_dev(ul3, li16);
    			append_dev(li16, a16);
    			append_dev(ul3, t39);
    			append_dev(ul3, li17);
    			append_dev(li17, a17);
    			append_dev(ul3, t41);
    			append_dev(ul3, li18);
    			append_dev(li18, a18);
    			append_dev(ul3, t43);
    			append_dev(ul3, li19);
    			append_dev(li19, a19);
    			append_dev(div3, t45);
    			append_dev(div3, div2);
    			append_dev(div2, svg5);
    			append_dev(svg5, path5);
    			append_dev(div2, t46);
    			append_dev(div2, a20);
    			append_dev(div109, t48);
    			append_dev(div109, div108);
    			append_dev(div108, div6);
    			append_dev(div6, div4);
    			append_dev(div4, button0);
    			append_dev(button0, svg6);
    			append_dev(svg6, path6);
    			append_dev(div4, t49);
    			append_dev(div4, button1);
    			append_dev(button1, svg7);
    			append_dev(svg7, path7);
    			append_dev(div6, t50);
    			append_dev(div6, div5);
    			append_dev(div5, button2);
    			append_dev(button2, svg8);
    			append_dev(svg8, path8);
    			append_dev(div5, t51);
    			append_dev(div5, a21);
    			append_dev(div5, t53);
    			append_dev(div5, button3);
    			append_dev(button3, svg9);
    			append_dev(svg9, path9);
    			append_dev(div108, t54);
    			append_dev(div108, div107);
    			append_dev(div107, div106);
    			append_dev(div106, div7);
    			append_dev(div7, a22);
    			append_dev(div7, t56);
    			append_dev(div7, a23);
    			append_dev(div106, t58);
    			append_dev(div106, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div8);
    			append_dev(div8, a24);
    			append_dev(a24, img0);
    			append_dev(div11, t59);
    			append_dev(div11, div10);
    			append_dev(div10, a25);
    			append_dev(div10, t61);
    			append_dev(div10, div9);
    			append_dev(div38, t63);
    			append_dev(div38, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div13);
    			append_dev(div13, a26);
    			append_dev(a26, img1);
    			append_dev(div16, t64);
    			append_dev(div16, div15);
    			append_dev(div15, a27);
    			append_dev(div15, t66);
    			append_dev(div15, div14);
    			append_dev(div38, t68);
    			append_dev(div38, div22);
    			append_dev(div22, div21);
    			append_dev(div21, div18);
    			append_dev(div18, a28);
    			append_dev(a28, img2);
    			append_dev(div21, t69);
    			append_dev(div21, div20);
    			append_dev(div20, a29);
    			append_dev(div20, t71);
    			append_dev(div20, div19);
    			append_dev(div38, t73);
    			append_dev(div38, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div23);
    			append_dev(div23, a30);
    			append_dev(a30, img3);
    			append_dev(div26, t74);
    			append_dev(div26, div25);
    			append_dev(div25, a31);
    			append_dev(div25, t76);
    			append_dev(div25, div24);
    			append_dev(div38, t78);
    			append_dev(div38, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div28);
    			append_dev(div28, a32);
    			append_dev(a32, img4);
    			append_dev(div31, t79);
    			append_dev(div31, div30);
    			append_dev(div30, a33);
    			append_dev(div30, t81);
    			append_dev(div30, div29);
    			append_dev(div38, t83);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div33);
    			append_dev(div33, a34);
    			append_dev(a34, img5);
    			append_dev(div36, t84);
    			append_dev(div36, div35);
    			append_dev(div35, a35);
    			append_dev(div35, t86);
    			append_dev(div35, div34);
    			append_dev(div106, t88);
    			append_dev(div106, div40);
    			append_dev(div40, a36);
    			append_dev(div40, t90);
    			append_dev(div40, a37);
    			append_dev(div106, t92);
    			append_dev(div106, div72);
    			append_dev(div72, div71);
    			append_dev(div71, div45);
    			append_dev(div45, div44);
    			append_dev(div44, div41);
    			append_dev(div41, a38);
    			append_dev(a38, img6);
    			append_dev(div44, t93);
    			append_dev(div44, div43);
    			append_dev(div43, a39);
    			append_dev(div43, t95);
    			append_dev(div43, div42);
    			append_dev(div71, t97);
    			append_dev(div71, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div46);
    			append_dev(div46, a40);
    			append_dev(a40, img7);
    			append_dev(div49, t98);
    			append_dev(div49, div48);
    			append_dev(div48, a41);
    			append_dev(div48, t100);
    			append_dev(div48, div47);
    			append_dev(div71, t102);
    			append_dev(div71, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div51);
    			append_dev(div51, a42);
    			append_dev(a42, img8);
    			append_dev(div54, t103);
    			append_dev(div54, div53);
    			append_dev(div53, a43);
    			append_dev(div53, t105);
    			append_dev(div53, div52);
    			append_dev(div71, t107);
    			append_dev(div71, div60);
    			append_dev(div60, div59);
    			append_dev(div59, div56);
    			append_dev(div56, a44);
    			append_dev(a44, img9);
    			append_dev(div59, t108);
    			append_dev(div59, div58);
    			append_dev(div58, a45);
    			append_dev(div58, t110);
    			append_dev(div58, div57);
    			append_dev(div71, t112);
    			append_dev(div71, div65);
    			append_dev(div65, div64);
    			append_dev(div64, div61);
    			append_dev(div61, a46);
    			append_dev(a46, img10);
    			append_dev(div64, t113);
    			append_dev(div64, div63);
    			append_dev(div63, a47);
    			append_dev(div63, t115);
    			append_dev(div63, div62);
    			append_dev(div71, t117);
    			append_dev(div71, div70);
    			append_dev(div70, div69);
    			append_dev(div69, div66);
    			append_dev(div66, a48);
    			append_dev(a48, img11);
    			append_dev(div69, t118);
    			append_dev(div69, div68);
    			append_dev(div68, a49);
    			append_dev(div68, t120);
    			append_dev(div68, div67);
    			append_dev(div106, t122);
    			append_dev(div106, div73);
    			append_dev(div73, a50);
    			append_dev(div73, t124);
    			append_dev(div73, a51);
    			append_dev(div106, t126);
    			append_dev(div106, div105);
    			append_dev(div105, div104);
    			append_dev(div104, div78);
    			append_dev(div78, div77);
    			append_dev(div77, div74);
    			append_dev(div74, a52);
    			append_dev(a52, img12);
    			append_dev(div77, t127);
    			append_dev(div77, div76);
    			append_dev(div76, a53);
    			append_dev(div76, t129);
    			append_dev(div76, div75);
    			append_dev(div104, t131);
    			append_dev(div104, div83);
    			append_dev(div83, div82);
    			append_dev(div82, div79);
    			append_dev(div79, a54);
    			append_dev(a54, img13);
    			append_dev(div82, t132);
    			append_dev(div82, div81);
    			append_dev(div81, a55);
    			append_dev(div81, t134);
    			append_dev(div81, div80);
    			append_dev(div104, t136);
    			append_dev(div104, div88);
    			append_dev(div88, div87);
    			append_dev(div87, div84);
    			append_dev(div84, a56);
    			append_dev(a56, img14);
    			append_dev(div87, t137);
    			append_dev(div87, div86);
    			append_dev(div86, a57);
    			append_dev(div86, t139);
    			append_dev(div86, div85);
    			append_dev(div104, t141);
    			append_dev(div104, div93);
    			append_dev(div93, div92);
    			append_dev(div92, div89);
    			append_dev(div89, a58);
    			append_dev(a58, img15);
    			append_dev(div92, t142);
    			append_dev(div92, div91);
    			append_dev(div91, a59);
    			append_dev(div91, t144);
    			append_dev(div91, div90);
    			append_dev(div104, t146);
    			append_dev(div104, div98);
    			append_dev(div98, div97);
    			append_dev(div97, div94);
    			append_dev(div94, a60);
    			append_dev(a60, img16);
    			append_dev(div97, t147);
    			append_dev(div97, div96);
    			append_dev(div96, a61);
    			append_dev(div96, t149);
    			append_dev(div96, div95);
    			append_dev(div104, t151);
    			append_dev(div104, div103);
    			append_dev(div103, div102);
    			append_dev(div102, div99);
    			append_dev(div99, a62);
    			append_dev(a62, img17);
    			append_dev(div102, t152);
    			append_dev(div102, div101);
    			append_dev(div101, a63);
    			append_dev(div101, t154);
    			append_dev(div101, div100);
    			append_dev(div111, t156);
    			append_dev(div111, div110);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spotify_UI", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spotify_UI> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Spotify_UI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spotify_UI",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.1 */

    function create_fragment$1(ctx) {
    	let spotify;
    	let current;
    	spotify = new Spotify_UI({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spotify.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(spotify, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spotify.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spotify.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spotify, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Spotify: Spotify_UI });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
