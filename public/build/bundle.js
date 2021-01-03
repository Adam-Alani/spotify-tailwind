
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
    	let div123;
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
    	let li20;
    	let a20;
    	let t47;
    	let li21;
    	let a21;
    	let t49;
    	let li22;
    	let a22;
    	let t51;
    	let li23;
    	let a23;
    	let t53;
    	let li24;
    	let a24;
    	let t55;
    	let div2;
    	let svg5;
    	let path5;
    	let t56;
    	let a25;
    	let t58;
    	let div108;
    	let div6;
    	let div4;
    	let button0;
    	let svg6;
    	let path6;
    	let t59;
    	let button1;
    	let svg7;
    	let path7;
    	let t60;
    	let div5;
    	let button2;
    	let svg8;
    	let path8;
    	let t61;
    	let a26;
    	let t63;
    	let button3;
    	let svg9;
    	let path9;
    	let t64;
    	let div107;
    	let div106;
    	let div7;
    	let a27;
    	let t66;
    	let a28;
    	let t68;
    	let div39;
    	let div38;
    	let div12;
    	let div11;
    	let div8;
    	let a29;
    	let img0;
    	let img0_src_value;
    	let t69;
    	let div10;
    	let a30;
    	let t71;
    	let div9;
    	let t73;
    	let div17;
    	let div16;
    	let div13;
    	let a31;
    	let img1;
    	let img1_src_value;
    	let t74;
    	let div15;
    	let a32;
    	let t76;
    	let div14;
    	let t78;
    	let div22;
    	let div21;
    	let div18;
    	let a33;
    	let img2;
    	let img2_src_value;
    	let t79;
    	let div20;
    	let a34;
    	let t81;
    	let div19;
    	let t83;
    	let div27;
    	let div26;
    	let div23;
    	let a35;
    	let img3;
    	let img3_src_value;
    	let t84;
    	let div25;
    	let a36;
    	let t86;
    	let div24;
    	let t88;
    	let div32;
    	let div31;
    	let div28;
    	let a37;
    	let img4;
    	let img4_src_value;
    	let t89;
    	let div30;
    	let a38;
    	let t91;
    	let div29;
    	let t93;
    	let div37;
    	let div36;
    	let div33;
    	let a39;
    	let img5;
    	let img5_src_value;
    	let t94;
    	let div35;
    	let a40;
    	let t96;
    	let div34;
    	let t98;
    	let div40;
    	let a41;
    	let t100;
    	let a42;
    	let t102;
    	let div72;
    	let div71;
    	let div45;
    	let div44;
    	let div41;
    	let a43;
    	let img6;
    	let img6_src_value;
    	let t103;
    	let div43;
    	let a44;
    	let t105;
    	let div42;
    	let t107;
    	let div50;
    	let div49;
    	let div46;
    	let a45;
    	let img7;
    	let img7_src_value;
    	let t108;
    	let div48;
    	let a46;
    	let t110;
    	let div47;
    	let t112;
    	let div55;
    	let div54;
    	let div51;
    	let a47;
    	let img8;
    	let img8_src_value;
    	let t113;
    	let div53;
    	let a48;
    	let t115;
    	let div52;
    	let t117;
    	let div60;
    	let div59;
    	let div56;
    	let a49;
    	let img9;
    	let img9_src_value;
    	let t118;
    	let div58;
    	let a50;
    	let t120;
    	let div57;
    	let t122;
    	let div65;
    	let div64;
    	let div61;
    	let a51;
    	let img10;
    	let img10_src_value;
    	let t123;
    	let div63;
    	let a52;
    	let t125;
    	let div62;
    	let t127;
    	let div70;
    	let div69;
    	let div66;
    	let a53;
    	let img11;
    	let img11_src_value;
    	let t128;
    	let div68;
    	let a54;
    	let t130;
    	let div67;
    	let t132;
    	let div73;
    	let a55;
    	let t134;
    	let a56;
    	let t136;
    	let div105;
    	let div104;
    	let div78;
    	let div77;
    	let div74;
    	let a57;
    	let img12;
    	let img12_src_value;
    	let t137;
    	let div76;
    	let a58;
    	let t139;
    	let div75;
    	let t141;
    	let div83;
    	let div82;
    	let div79;
    	let a59;
    	let img13;
    	let img13_src_value;
    	let t142;
    	let div81;
    	let a60;
    	let t144;
    	let div80;
    	let t146;
    	let div88;
    	let div87;
    	let div84;
    	let a61;
    	let img14;
    	let img14_src_value;
    	let t147;
    	let div86;
    	let a62;
    	let t149;
    	let div85;
    	let t151;
    	let div93;
    	let div92;
    	let div89;
    	let a63;
    	let img15;
    	let img15_src_value;
    	let t152;
    	let div91;
    	let a64;
    	let t154;
    	let div90;
    	let t156;
    	let div98;
    	let div97;
    	let div94;
    	let a65;
    	let img16;
    	let img16_src_value;
    	let t157;
    	let div96;
    	let a66;
    	let t159;
    	let div95;
    	let t161;
    	let div103;
    	let div102;
    	let div99;
    	let a67;
    	let img17;
    	let img17_src_value;
    	let t162;
    	let div101;
    	let a68;
    	let t164;
    	let div100;
    	let t166;
    	let div122;
    	let div113;
    	let a69;
    	let img18;
    	let img18_src_value;
    	let t167;
    	let div112;
    	let div110;
    	let a70;
    	let t169;
    	let div111;
    	let a71;
    	let t171;
    	let div119;
    	let div114;
    	let button4;
    	let svg10;
    	let path10;
    	let t172;
    	let button5;
    	let svg11;
    	let g1;
    	let g0;
    	let path11;
    	let t173;
    	let button6;
    	let svg12;
    	let path12;
    	let path13;
    	let t174;
    	let button7;
    	let svg13;
    	let g3;
    	let g2;
    	let path14;
    	let t175;
    	let button8;
    	let svg14;
    	let g5;
    	let g4;
    	let path15;
    	let t176;
    	let div118;
    	let div115;
    	let t178;
    	let div116;
    	let t179;
    	let div117;
    	let t181;
    	let div121;
    	let button9;
    	let svg15;
    	let g7;
    	let g6;
    	let path16;
    	let t182;
    	let button10;
    	let svg16;
    	let path17;
    	let t183;
    	let button11;
    	let svg17;
    	let path18;
    	let t184;
    	let div120;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div123 = element("div");
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
    			a19.textContent = "Hot Country";
    			t45 = space();
    			li20 = element("li");
    			a20 = element("a");
    			a20.textContent = "Get Turnt";
    			t47 = space();
    			li21 = element("li");
    			a21 = element("a");
    			a21.textContent = "Mood Booster";
    			t49 = space();
    			li22 = element("li");
    			a22 = element("a");
    			a22.textContent = "mint";
    			t51 = space();
    			li23 = element("li");
    			a23 = element("a");
    			a23.textContent = "Esquenta Sertanejo";
    			t53 = space();
    			li24 = element("li");
    			a24 = element("a");
    			a24.textContent = "Happy Hits!";
    			t55 = space();
    			div2 = element("div");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t56 = space();
    			a25 = element("a");
    			a25.textContent = "Install App";
    			t58 = space();
    			div108 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			t59 = space();
    			button1 = element("button");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			t60 = space();
    			div5 = element("div");
    			button2 = element("button");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			t61 = space();
    			a26 = element("a");
    			a26.textContent = "xAtomicYT";
    			t63 = space();
    			button3 = element("button");
    			svg9 = svg_element("svg");
    			path9 = svg_element("path");
    			t64 = space();
    			div107 = element("div");
    			div106 = element("div");
    			div7 = element("div");
    			a27 = element("a");
    			a27.textContent = "Shortcuts";
    			t66 = space();
    			a28 = element("a");
    			a28.textContent = "See All";
    			t68 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div8 = element("div");
    			a29 = element("a");
    			img0 = element("img");
    			t69 = space();
    			div10 = element("div");
    			a30 = element("a");
    			a30.textContent = "Sad Songs";
    			t71 = space();
    			div9 = element("div");
    			div9.textContent = "I cry to this";
    			t73 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div13 = element("div");
    			a31 = element("a");
    			img1 = element("img");
    			t74 = space();
    			div15 = element("div");
    			a32 = element("a");
    			a32.textContent = "Blond";
    			t76 = space();
    			div14 = element("div");
    			div14.textContent = "Frank Ocean";
    			t78 = space();
    			div22 = element("div");
    			div21 = element("div");
    			div18 = element("div");
    			a33 = element("a");
    			img2 = element("img");
    			t79 = space();
    			div20 = element("div");
    			a34 = element("a");
    			a34.textContent = "Fine Line";
    			t81 = space();
    			div19 = element("div");
    			div19.textContent = "Harry Styles";
    			t83 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div23 = element("div");
    			a35 = element("a");
    			img3 = element("img");
    			t84 = space();
    			div25 = element("div");
    			a36 = element("a");
    			a36.textContent = "DJ Khaled";
    			t86 = space();
    			div24 = element("div");
    			div24.textContent = "Artist";
    			t88 = space();
    			div32 = element("div");
    			div31 = element("div");
    			div28 = element("div");
    			a37 = element("a");
    			img4 = element("img");
    			t89 = space();
    			div30 = element("div");
    			a38 = element("a");
    			a38.textContent = "Wish You Were Here";
    			t91 = space();
    			div29 = element("div");
    			div29.textContent = "Pink Floyd";
    			t93 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div33 = element("div");
    			a39 = element("a");
    			img5 = element("img");
    			t94 = space();
    			div35 = element("div");
    			a40 = element("a");
    			a40.textContent = "AM";
    			t96 = space();
    			div34 = element("div");
    			div34.textContent = "Arctic Monkeys";
    			t98 = space();
    			div40 = element("div");
    			a41 = element("a");
    			a41.textContent = "Recently played";
    			t100 = space();
    			a42 = element("a");
    			a42.textContent = "See All";
    			t102 = space();
    			div72 = element("div");
    			div71 = element("div");
    			div45 = element("div");
    			div44 = element("div");
    			div41 = element("div");
    			a43 = element("a");
    			img6 = element("img");
    			t103 = space();
    			div43 = element("div");
    			a44 = element("a");
    			a44.textContent = "Sad Songs";
    			t105 = space();
    			div42 = element("div");
    			div42.textContent = "I cry to this";
    			t107 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div46 = element("div");
    			a45 = element("a");
    			img7 = element("img");
    			t108 = space();
    			div48 = element("div");
    			a46 = element("a");
    			a46.textContent = "Blond";
    			t110 = space();
    			div47 = element("div");
    			div47.textContent = "Frank Ocean";
    			t112 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div51 = element("div");
    			a47 = element("a");
    			img8 = element("img");
    			t113 = space();
    			div53 = element("div");
    			a48 = element("a");
    			a48.textContent = "Fine Line";
    			t115 = space();
    			div52 = element("div");
    			div52.textContent = "Harry Styles";
    			t117 = space();
    			div60 = element("div");
    			div59 = element("div");
    			div56 = element("div");
    			a49 = element("a");
    			img9 = element("img");
    			t118 = space();
    			div58 = element("div");
    			a50 = element("a");
    			a50.textContent = "DJ Khaled";
    			t120 = space();
    			div57 = element("div");
    			div57.textContent = "Artist";
    			t122 = space();
    			div65 = element("div");
    			div64 = element("div");
    			div61 = element("div");
    			a51 = element("a");
    			img10 = element("img");
    			t123 = space();
    			div63 = element("div");
    			a52 = element("a");
    			a52.textContent = "Wish You Were Here";
    			t125 = space();
    			div62 = element("div");
    			div62.textContent = "Pink Floyd";
    			t127 = space();
    			div70 = element("div");
    			div69 = element("div");
    			div66 = element("div");
    			a53 = element("a");
    			img11 = element("img");
    			t128 = space();
    			div68 = element("div");
    			a54 = element("a");
    			a54.textContent = "AM";
    			t130 = space();
    			div67 = element("div");
    			div67.textContent = "Arctic Monkeys";
    			t132 = space();
    			div73 = element("div");
    			a55 = element("a");
    			a55.textContent = "Jump back in";
    			t134 = space();
    			a56 = element("a");
    			a56.textContent = "See All";
    			t136 = space();
    			div105 = element("div");
    			div104 = element("div");
    			div78 = element("div");
    			div77 = element("div");
    			div74 = element("div");
    			a57 = element("a");
    			img12 = element("img");
    			t137 = space();
    			div76 = element("div");
    			a58 = element("a");
    			a58.textContent = "Sad Songs";
    			t139 = space();
    			div75 = element("div");
    			div75.textContent = "I cry to this";
    			t141 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div79 = element("div");
    			a59 = element("a");
    			img13 = element("img");
    			t142 = space();
    			div81 = element("div");
    			a60 = element("a");
    			a60.textContent = "Blond";
    			t144 = space();
    			div80 = element("div");
    			div80.textContent = "Frank Ocean";
    			t146 = space();
    			div88 = element("div");
    			div87 = element("div");
    			div84 = element("div");
    			a61 = element("a");
    			img14 = element("img");
    			t147 = space();
    			div86 = element("div");
    			a62 = element("a");
    			a62.textContent = "Fine Line";
    			t149 = space();
    			div85 = element("div");
    			div85.textContent = "Harry Styles";
    			t151 = space();
    			div93 = element("div");
    			div92 = element("div");
    			div89 = element("div");
    			a63 = element("a");
    			img15 = element("img");
    			t152 = space();
    			div91 = element("div");
    			a64 = element("a");
    			a64.textContent = "DJ Khaled";
    			t154 = space();
    			div90 = element("div");
    			div90.textContent = "Artist";
    			t156 = space();
    			div98 = element("div");
    			div97 = element("div");
    			div94 = element("div");
    			a65 = element("a");
    			img16 = element("img");
    			t157 = space();
    			div96 = element("div");
    			a66 = element("a");
    			a66.textContent = "Wish You Were Here";
    			t159 = space();
    			div95 = element("div");
    			div95.textContent = "Pink Floyd";
    			t161 = space();
    			div103 = element("div");
    			div102 = element("div");
    			div99 = element("div");
    			a67 = element("a");
    			img17 = element("img");
    			t162 = space();
    			div101 = element("div");
    			a68 = element("a");
    			a68.textContent = "AM";
    			t164 = space();
    			div100 = element("div");
    			div100.textContent = "Arctic Monkeys";
    			t166 = space();
    			div122 = element("div");
    			div113 = element("div");
    			a69 = element("a");
    			img18 = element("img");
    			t167 = space();
    			div112 = element("div");
    			div110 = element("div");
    			a70 = element("a");
    			a70.textContent = "Here Comes the Sun";
    			t169 = space();
    			div111 = element("div");
    			a71 = element("a");
    			a71.textContent = "The Beatles";
    			t171 = space();
    			div119 = element("div");
    			div114 = element("div");
    			button4 = element("button");
    			svg10 = svg_element("svg");
    			path10 = svg_element("path");
    			t172 = space();
    			button5 = element("button");
    			svg11 = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path11 = svg_element("path");
    			t173 = space();
    			button6 = element("button");
    			svg12 = svg_element("svg");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			t174 = space();
    			button7 = element("button");
    			svg13 = svg_element("svg");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path14 = svg_element("path");
    			t175 = space();
    			button8 = element("button");
    			svg14 = svg_element("svg");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			path15 = svg_element("path");
    			t176 = space();
    			div118 = element("div");
    			div115 = element("div");
    			div115.textContent = "0:00";
    			t178 = space();
    			div116 = element("div");
    			t179 = space();
    			div117 = element("div");
    			div117.textContent = "3:48";
    			t181 = space();
    			div121 = element("div");
    			button9 = element("button");
    			svg15 = svg_element("svg");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			path16 = svg_element("path");
    			t182 = space();
    			button10 = element("button");
    			svg16 = svg_element("svg");
    			path17 = svg_element("path");
    			t183 = space();
    			button11 = element("button");
    			svg17 = svg_element("svg");
    			path18 = svg_element("path");
    			t184 = space();
    			div120 = element("div");
    			attr_dev(path0, "d", "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z");
    			attr_dev(path0, "class", "svelte-u7z48g");
    			add_location(path0, file, 12, 168, 654);
    			attr_dev(svg0, "class", "group-hover:text-white  svelte-u7z48g");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			add_location(svg0, file, 12, 32, 518);
    			attr_dev(span0, "class", "ml-3 group-hover:text-white svelte-u7z48g");
    			add_location(span0, file, 13, 32, 898);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "flex items-center mx-4 mt-4 group   svelte-u7z48g");
    			add_location(a0, file, 11, 28, 428);
    			attr_dev(li0, "class", "svelte-u7z48g");
    			add_location(li0, file, 10, 24, 394);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "class", "svelte-u7z48g");
    			add_location(path1, file, 17, 168, 1274);
    			attr_dev(svg1, "class", "group-hover:text-white  svelte-u7z48g");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			add_location(svg1, file, 17, 32, 1138);
    			attr_dev(span1, "class", "group-hover:text-white ml-3 svelte-u7z48g");
    			add_location(span1, file, 18, 32, 1478);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "flex items-center mx-4 mt-4 group svelte-u7z48g");
    			add_location(a1, file, 16, 28, 1050);
    			attr_dev(li1, "class", "svelte-u7z48g");
    			add_location(li1, file, 15, 24, 1016);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "d", "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "class", "svelte-u7z48g");
    			add_location(path2, file, 23, 168, 1882);
    			attr_dev(svg2, "class", "group-hover:text-white  svelte-u7z48g");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "currentColor");
    			attr_dev(svg2, "viewBox", "0 0 20 20");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			add_location(svg2, file, 23, 32, 1746);
    			attr_dev(span2, "class", " group-hover:text-white ml-3 svelte-u7z48g");
    			add_location(span2, file, 24, 32, 2162);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "flex items-center mx-4 mt-4 group svelte-u7z48g");
    			add_location(a2, file, 22, 28, 1658);
    			attr_dev(li2, "class", "svelte-u7z48g");
    			add_location(li2, file, 21, 24, 1624);
    			attr_dev(ul0, "class", "py-6 font-bold ml-2 playlists svelte-u7z48g");
    			add_location(ul0, file, 9, 20, 326);
    			attr_dev(h1, "class", "uppercase cursor-default svelte-u7z48g");
    			add_location(h1, file, 31, 32, 2498);
    			attr_dev(a3, "class", "flex items-center mx-4 mt-4 svelte-u7z48g");
    			add_location(a3, file, 30, 28, 2425);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "d", "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z");
    			attr_dev(path3, "clip-rule", "evenodd");
    			attr_dev(path3, "class", "svelte-u7z48g");
    			add_location(path3, file, 36, 175, 2942);
    			attr_dev(svg3, "class", "group-hover:text-white svelte-u7z48g");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "fill", "currentColor");
    			attr_dev(svg3, "viewBox", "0 0 20 20");
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "24");
    			add_location(svg3, file, 36, 40, 2807);
    			attr_dev(span3, "class", "group-hover:text-white ml-4 svelte-u7z48g");
    			add_location(span3, file, 37, 40, 3127);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "flex items-center mx-4 mt-4 group svelte-u7z48g");
    			add_location(a4, file, 35, 36, 2711);
    			attr_dev(li3, "class", "svelte-u7z48g");
    			add_location(li3, file, 34, 32, 2669);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "d", "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "class", "svelte-u7z48g");
    			add_location(path4, file, 42, 175, 3579);
    			attr_dev(svg4, "class", "group-hover:text-white svelte-u7z48g");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "fill", "currentColor");
    			attr_dev(svg4, "viewBox", "0 0 20 20");
    			attr_dev(svg4, "width", "24");
    			attr_dev(svg4, "height", "24");
    			add_location(svg4, file, 42, 40, 3444);
    			attr_dev(span4, "class", "group-hover:text-white ml-4 svelte-u7z48g");
    			add_location(span4, file, 43, 40, 3788);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "flex items-center mx-4 mt-4 group svelte-u7z48g");
    			add_location(a5, file, 41, 36, 3348);
    			attr_dev(li4, "class", "svelte-u7z48g");
    			add_location(li4, file, 40, 32, 3306);
    			attr_dev(ul1, "class", "font-bold svelte-u7z48g");
    			add_location(ul1, file, 33, 28, 2613);
    			attr_dev(li5, "class", "svelte-u7z48g");
    			add_location(li5, file, 29, 24, 2391);
    			attr_dev(ul2, "class", "ml-2 playlists svelte-u7z48g");
    			add_location(ul2, file, 28, 20, 2338);
    			attr_dev(hr, "class", "divider mt-4 m-auto svelte-u7z48g");
    			add_location(hr, file, 50, 20, 4046);
    			attr_dev(div0, "class", "svelte-u7z48g");
    			add_location(div0, file, 8, 16, 299);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a6, file, 54, 45, 4276);
    			attr_dev(li6, "class", "truncate svelte-u7z48g");
    			add_location(li6, file, 54, 24, 4255);
    			attr_dev(a7, "href", "#");
    			attr_dev(a7, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a7, file, 55, 45, 4397);
    			attr_dev(li7, "class", "truncate svelte-u7z48g");
    			add_location(li7, file, 55, 24, 4376);
    			attr_dev(a8, "href", "#");
    			attr_dev(a8, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a8, file, 56, 45, 4515);
    			attr_dev(li8, "class", "truncate svelte-u7z48g");
    			add_location(li8, file, 56, 24, 4494);
    			attr_dev(a9, "href", "#");
    			attr_dev(a9, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a9, file, 57, 45, 4629);
    			attr_dev(li9, "class", "truncate svelte-u7z48g");
    			add_location(li9, file, 57, 24, 4608);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a10, file, 58, 45, 4745);
    			attr_dev(li10, "class", "truncate svelte-u7z48g");
    			add_location(li10, file, 58, 24, 4724);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a11, file, 59, 45, 4865);
    			attr_dev(li11, "class", "truncate svelte-u7z48g");
    			add_location(li11, file, 59, 24, 4844);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a12, file, 60, 45, 4994);
    			attr_dev(li12, "class", "truncate svelte-u7z48g");
    			add_location(li12, file, 60, 24, 4973);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a13, file, 61, 45, 5126);
    			attr_dev(li13, "class", "truncate svelte-u7z48g");
    			add_location(li13, file, 61, 24, 5105);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a14, file, 62, 45, 5242);
    			attr_dev(li14, "class", "truncate svelte-u7z48g");
    			add_location(li14, file, 62, 24, 5221);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a15, file, 63, 45, 5360);
    			attr_dev(li15, "class", "truncate svelte-u7z48g");
    			add_location(li15, file, 63, 24, 5339);
    			attr_dev(a16, "href", "#");
    			attr_dev(a16, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a16, file, 64, 45, 5476);
    			attr_dev(li16, "class", "truncate svelte-u7z48g");
    			add_location(li16, file, 64, 24, 5455);
    			attr_dev(a17, "href", "#");
    			attr_dev(a17, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a17, file, 65, 45, 5591);
    			attr_dev(li17, "class", "truncate svelte-u7z48g");
    			add_location(li17, file, 65, 24, 5570);
    			attr_dev(a18, "href", "#");
    			attr_dev(a18, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a18, file, 66, 45, 5707);
    			attr_dev(li18, "class", "truncate svelte-u7z48g");
    			add_location(li18, file, 66, 24, 5686);
    			attr_dev(a19, "href", "#");
    			attr_dev(a19, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a19, file, 67, 45, 5822);
    			attr_dev(li19, "class", "truncate svelte-u7z48g");
    			add_location(li19, file, 67, 24, 5801);
    			attr_dev(a20, "href", "#");
    			attr_dev(a20, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a20, file, 68, 45, 5938);
    			attr_dev(li20, "class", "truncate svelte-u7z48g");
    			add_location(li20, file, 68, 24, 5917);
    			attr_dev(a21, "href", "#");
    			attr_dev(a21, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a21, file, 69, 45, 6052);
    			attr_dev(li21, "class", "truncate svelte-u7z48g");
    			add_location(li21, file, 69, 24, 6031);
    			attr_dev(a22, "href", "#");
    			attr_dev(a22, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a22, file, 70, 45, 6169);
    			attr_dev(li22, "class", "truncate svelte-u7z48g");
    			add_location(li22, file, 70, 24, 6148);
    			attr_dev(a23, "href", "#");
    			attr_dev(a23, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a23, file, 71, 45, 6278);
    			attr_dev(li23, "class", "truncate svelte-u7z48g");
    			add_location(li23, file, 71, 24, 6257);
    			attr_dev(a24, "href", "#");
    			attr_dev(a24, "class", "hover:text-white font-normal svelte-u7z48g");
    			add_location(a24, file, 72, 45, 6401);
    			attr_dev(li24, "class", "truncate svelte-u7z48g");
    			add_location(li24, file, 72, 24, 6380);
    			attr_dev(ul3, "class", "leading-loose playlists svelte-u7z48g");
    			add_location(ul3, file, 53, 20, 4193);
    			attr_dev(div1, "class", "scroll overflow-y-auto px-5 mt-4 ml-1 svelte-u7z48g");
    			add_location(div1, file, 52, 16, 4120);
    			attr_dev(path5, "stroke-linecap", "round");
    			attr_dev(path5, "stroke-linejoin", "round");
    			attr_dev(path5, "stroke-width", "2");
    			attr_dev(path5, "d", "M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z");
    			attr_dev(path5, "class", "svelte-u7z48g");
    			add_location(path5, file, 76, 180, 6786);
    			attr_dev(svg5, "class", "icon-color group-hover:text-white svelte-u7z48g");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "width", "24");
    			attr_dev(svg5, "height", "24");
    			add_location(svg5, file, 76, 20, 6626);
    			attr_dev(a25, "href", "#");
    			attr_dev(a25, "class", "playlists ml-1 group-hover:text-white svelte-u7z48g");
    			add_location(a25, file, 77, 20, 6948);
    			attr_dev(div2, "class", "bottom h-16 px-4 py-1 flex items-center group ml-2  svelte-u7z48g");
    			add_location(div2, file, 75, 16, 6539);
    			attr_dev(div3, "class", "sideBar flex-none text-white justify-between flex flex-col font-semibold svelte-u7z48g");
    			add_location(div3, file, 7, 12, 195);
    			attr_dev(path6, "fill-rule", "evenodd");
    			attr_dev(path6, "d", "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z");
    			attr_dev(path6, "clip-rule", "evenodd");
    			attr_dev(path6, "class", "svelte-u7z48g");
    			add_location(path6, file, 84, 168, 7484);
    			attr_dev(svg6, "class", "icon-color hover:text-white svelte-u7z48g");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg6, "fill", "currentColor");
    			attr_dev(svg6, "viewBox", "0 0 20 20");
    			attr_dev(svg6, "width", "34");
    			attr_dev(svg6, "height", "34");
    			add_location(svg6, file, 84, 28, 7344);
    			attr_dev(button0, "class", "bg-black rounded-full svelte-u7z48g");
    			add_location(button0, file, 83, 24, 7276);
    			attr_dev(path7, "fill-rule", "evenodd");
    			attr_dev(path7, "d", "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z");
    			attr_dev(path7, "clip-rule", "evenodd");
    			attr_dev(path7, "class", "svelte-u7z48g");
    			add_location(path7, file, 87, 168, 7925);
    			attr_dev(svg7, "class", "icon-color hover:text-white svelte-u7z48g");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg7, "fill", "currentColor");
    			attr_dev(svg7, "viewBox", "0 0 20 20");
    			attr_dev(svg7, "width", "34");
    			attr_dev(svg7, "height", "34");
    			add_location(svg7, file, 87, 28, 7785);
    			attr_dev(button1, "class", "bg-black rounded-full svelte-u7z48g");
    			add_location(button1, file, 86, 24, 7716);
    			attr_dev(div4, "class", "py-2 svelte-u7z48g");
    			add_location(div4, file, 82, 20, 7232);
    			attr_dev(path8, "fill-rule", "evenodd");
    			attr_dev(path8, "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z");
    			attr_dev(path8, "clip-rule", "evenodd");
    			attr_dev(path8, "class", "svelte-u7z48g");
    			add_location(path8, file, 92, 131, 8409);
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg8, "fill", "currentColor");
    			attr_dev(svg8, "viewBox", "0 0 20 20");
    			attr_dev(svg8, "width", "34");
    			attr_dev(svg8, "height", "34");
    			attr_dev(svg8, "class", "svelte-u7z48g");
    			add_location(svg8, file, 92, 28, 8306);
    			attr_dev(button2, "class", "svelte-u7z48g");
    			add_location(button2, file, 91, 24, 8268);
    			attr_dev(a26, "href", "#");
    			attr_dev(a26, "class", "ml-2 svelte-u7z48g");
    			add_location(a26, file, 94, 24, 8684);
    			attr_dev(path9, "fill-rule", "evenodd");
    			attr_dev(path9, "d", "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z");
    			attr_dev(path9, "clip-rule", "evenodd");
    			attr_dev(path9, "class", "svelte-u7z48g");
    			add_location(path9, file, 96, 131, 8889);
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg9, "fill", "currentColor");
    			attr_dev(svg9, "viewBox", "0 0 20 20");
    			attr_dev(svg9, "width", "34");
    			attr_dev(svg9, "height", "34");
    			attr_dev(svg9, "class", "svelte-u7z48g");
    			add_location(svg9, file, 96, 28, 8786);
    			attr_dev(button3, "class", "svelte-u7z48g");
    			add_location(button3, file, 95, 24, 8748);
    			attr_dev(div5, "class", "flex items-center group bg-black rounded-full  svelte-u7z48g");
    			add_location(div5, file, 90, 20, 8182);
    			attr_dev(div6, "class", "flex items-center justify-between px-8 py-2 svelte-u7z48g");
    			add_location(div6, file, 81, 16, 7153);
    			attr_dev(a27, "href", "#");
    			attr_dev(a27, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-u7z48g");
    			add_location(a27, file, 105, 28, 9351);
    			attr_dev(a28, "href", "#");
    			attr_dev(a28, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-u7z48g");
    			add_location(a28, file, 106, 28, 9490);
    			attr_dev(div7, "class", "flex justify-between inline-block pt-2 svelte-u7z48g");
    			add_location(div7, file, 104, 24, 9269);
    			attr_dev(img0, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img0.src !== (img0_src_value = "covers/cover0.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "cover");
    			add_location(img0, file, 114, 57, 10120);
    			attr_dev(a29, "href", "#");
    			attr_dev(a29, "class", "svelte-u7z48g");
    			add_location(a29, file, 114, 44, 10107);
    			attr_dev(div8, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div8, file, 113, 40, 10026);
    			attr_dev(a30, "href", "#");
    			attr_dev(a30, "class", "font-bold svelte-u7z48g");
    			add_location(a30, file, 117, 44, 10364);
    			attr_dev(div9, "class", "playlists svelte-u7z48g");
    			add_location(div9, file, 118, 44, 10453);
    			attr_dev(div10, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div10, file, 116, 40, 10285);
    			attr_dev(div11, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div11, file, 112, 36, 9945);
    			attr_dev(div12, "class", "inline-block  min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div12, file, 111, 32, 9832);
    			attr_dev(img1, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img1.src !== (img1_src_value = "covers/cover1.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "cover");
    			add_location(img1, file, 126, 57, 10951);
    			attr_dev(a31, "href", "#");
    			attr_dev(a31, "class", "svelte-u7z48g");
    			add_location(a31, file, 126, 44, 10938);
    			attr_dev(div13, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div13, file, 125, 40, 10857);
    			attr_dev(a32, "href", "#");
    			attr_dev(a32, "class", "font-bold svelte-u7z48g");
    			add_location(a32, file, 129, 44, 11195);
    			attr_dev(div14, "class", "playlists svelte-u7z48g");
    			add_location(div14, file, 130, 44, 11280);
    			attr_dev(div15, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div15, file, 128, 40, 11116);
    			attr_dev(div16, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div16, file, 124, 36, 10776);
    			attr_dev(div17, "class", " inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div17, file, 123, 32, 10663);
    			attr_dev(img2, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img2.src !== (img2_src_value = "covers/cover2.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "cover");
    			add_location(img2, file, 138, 57, 11776);
    			attr_dev(a33, "href", "#");
    			attr_dev(a33, "class", "svelte-u7z48g");
    			add_location(a33, file, 138, 44, 11763);
    			attr_dev(div18, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div18, file, 137, 40, 11682);
    			attr_dev(a34, "href", "#");
    			attr_dev(a34, "class", "font-bold svelte-u7z48g");
    			add_location(a34, file, 141, 44, 12020);
    			attr_dev(div19, "class", "playlists svelte-u7z48g");
    			add_location(div19, file, 142, 44, 12109);
    			attr_dev(div20, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div20, file, 140, 40, 11941);
    			attr_dev(div21, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div21, file, 136, 36, 11601);
    			attr_dev(div22, "class", " inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div22, file, 135, 32, 11488);
    			attr_dev(img3, "class", " rounded-full shadow-md svelte-u7z48g");
    			if (img3.src !== (img3_src_value = "covers/artist0.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "cover");
    			add_location(img3, file, 150, 57, 12605);
    			attr_dev(a35, "href", "#");
    			attr_dev(a35, "class", "svelte-u7z48g");
    			add_location(a35, file, 150, 44, 12592);
    			attr_dev(div23, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div23, file, 149, 40, 12511);
    			attr_dev(a36, "href", "#");
    			attr_dev(a36, "class", "font-bold  svelte-u7z48g");
    			add_location(a36, file, 153, 44, 12852);
    			attr_dev(div24, "class", "playlists svelte-u7z48g");
    			add_location(div24, file, 154, 44, 12942);
    			attr_dev(div25, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div25, file, 152, 40, 12773);
    			attr_dev(div26, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div26, file, 148, 36, 12430);
    			attr_dev(div27, "class", "inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div27, file, 147, 32, 12318);
    			attr_dev(img4, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img4.src !== (img4_src_value = "covers/cover3.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "cover");
    			add_location(img4, file, 162, 57, 13432);
    			attr_dev(a37, "href", "#");
    			attr_dev(a37, "class", "svelte-u7z48g");
    			add_location(a37, file, 162, 44, 13419);
    			attr_dev(div28, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div28, file, 161, 40, 13338);
    			attr_dev(a38, "href", "#");
    			attr_dev(a38, "class", "font-bold  svelte-u7z48g");
    			add_location(a38, file, 165, 44, 13676);
    			attr_dev(div29, "class", "playlists svelte-u7z48g");
    			add_location(div29, file, 166, 44, 13775);
    			attr_dev(div30, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div30, file, 164, 40, 13597);
    			attr_dev(div31, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div31, file, 160, 36, 13257);
    			attr_dev(div32, "class", "inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div32, file, 159, 32, 13145);
    			attr_dev(img5, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img5.src !== (img5_src_value = "covers/cover4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "cover");
    			add_location(img5, file, 174, 57, 14269);
    			attr_dev(a39, "href", "#");
    			attr_dev(a39, "class", "svelte-u7z48g");
    			add_location(a39, file, 174, 44, 14256);
    			attr_dev(div33, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div33, file, 173, 40, 14175);
    			attr_dev(a40, "href", "#");
    			attr_dev(a40, "class", "font-bold svelte-u7z48g");
    			add_location(a40, file, 177, 44, 14513);
    			attr_dev(div34, "class", "playlists  svelte-u7z48g");
    			add_location(div34, file, 178, 44, 14595);
    			attr_dev(div35, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div35, file, 176, 40, 14434);
    			attr_dev(div36, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div36, file, 172, 36, 14094);
    			attr_dev(div37, "class", "inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2 svelte-u7z48g");
    			add_location(div37, file, 171, 32, 13982);
    			attr_dev(div38, "id", "horiScroll");
    			attr_dev(div38, "class", "whitespace-nowrap overflow-x-scroll overflow-y-hidden svelte-u7z48g");
    			add_location(div38, file, 109, 28, 9713);
    			attr_dev(div39, "class", "px-4 svelte-u7z48g");
    			add_location(div39, file, 108, 24, 9664);
    			attr_dev(a41, "href", "#");
    			attr_dev(a41, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-u7z48g");
    			add_location(a41, file, 187, 28, 14951);
    			attr_dev(a42, "href", "#");
    			attr_dev(a42, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-u7z48g");
    			add_location(a42, file, 188, 28, 15096);
    			attr_dev(div40, "class", "flex justify-between inline-block pt-8 svelte-u7z48g");
    			add_location(div40, file, 186, 24, 14869);
    			attr_dev(img6, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img6.src !== (img6_src_value = "covers/cover0.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "cover");
    			add_location(img6, file, 196, 57, 15747);
    			attr_dev(a43, "href", "#");
    			attr_dev(a43, "class", "svelte-u7z48g");
    			add_location(a43, file, 196, 44, 15734);
    			attr_dev(div41, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div41, file, 195, 40, 15653);
    			attr_dev(a44, "href", "#");
    			attr_dev(a44, "class", "font-bold svelte-u7z48g");
    			add_location(a44, file, 199, 44, 15991);
    			attr_dev(div42, "class", "playlists svelte-u7z48g");
    			add_location(div42, file, 200, 44, 16080);
    			attr_dev(div43, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div43, file, 198, 40, 15912);
    			attr_dev(div44, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div44, file, 194, 36, 15572);
    			attr_dev(div45, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div45, file, 193, 32, 15445);
    			attr_dev(img7, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img7.src !== (img7_src_value = "covers/cover1.jpg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "cover");
    			add_location(img7, file, 208, 57, 16593);
    			attr_dev(a45, "href", "#");
    			attr_dev(a45, "class", "svelte-u7z48g");
    			add_location(a45, file, 208, 44, 16580);
    			attr_dev(div46, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div46, file, 207, 40, 16499);
    			attr_dev(a46, "href", "#");
    			attr_dev(a46, "class", "font-bold svelte-u7z48g");
    			add_location(a46, file, 211, 44, 16837);
    			attr_dev(div47, "class", "playlists svelte-u7z48g");
    			add_location(div47, file, 212, 44, 16922);
    			attr_dev(div48, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div48, file, 210, 40, 16758);
    			attr_dev(div49, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div49, file, 206, 36, 16418);
    			attr_dev(div50, "class", " inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div50, file, 205, 32, 16290);
    			attr_dev(img8, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img8.src !== (img8_src_value = "covers/cover2.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "cover");
    			add_location(img8, file, 220, 57, 17433);
    			attr_dev(a47, "href", "#");
    			attr_dev(a47, "class", "svelte-u7z48g");
    			add_location(a47, file, 220, 44, 17420);
    			attr_dev(div51, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div51, file, 219, 40, 17339);
    			attr_dev(a48, "href", "#");
    			attr_dev(a48, "class", "font-bold svelte-u7z48g");
    			add_location(a48, file, 223, 44, 17677);
    			attr_dev(div52, "class", "playlists svelte-u7z48g");
    			add_location(div52, file, 224, 44, 17766);
    			attr_dev(div53, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div53, file, 222, 40, 17598);
    			attr_dev(div54, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div54, file, 218, 36, 17258);
    			attr_dev(div55, "class", " inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div55, file, 217, 32, 17130);
    			attr_dev(img9, "class", " rounded-full shadow-md svelte-u7z48g");
    			if (img9.src !== (img9_src_value = "covers/artist0.jpg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "cover");
    			add_location(img9, file, 232, 57, 18277);
    			attr_dev(a49, "href", "#");
    			attr_dev(a49, "class", "svelte-u7z48g");
    			add_location(a49, file, 232, 44, 18264);
    			attr_dev(div56, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div56, file, 231, 40, 18183);
    			attr_dev(a50, "href", "#");
    			attr_dev(a50, "class", "font-bold  svelte-u7z48g");
    			add_location(a50, file, 235, 44, 18524);
    			attr_dev(div57, "class", "playlists svelte-u7z48g");
    			add_location(div57, file, 236, 44, 18614);
    			attr_dev(div58, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div58, file, 234, 40, 18445);
    			attr_dev(div59, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div59, file, 230, 36, 18102);
    			attr_dev(div60, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div60, file, 229, 32, 17975);
    			attr_dev(img10, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img10.src !== (img10_src_value = "covers/cover3.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "cover");
    			add_location(img10, file, 244, 57, 19119);
    			attr_dev(a51, "href", "#");
    			attr_dev(a51, "class", "svelte-u7z48g");
    			add_location(a51, file, 244, 44, 19106);
    			attr_dev(div61, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div61, file, 243, 40, 19025);
    			attr_dev(a52, "href", "#");
    			attr_dev(a52, "class", "font-bold  svelte-u7z48g");
    			add_location(a52, file, 247, 44, 19363);
    			attr_dev(div62, "class", "playlists svelte-u7z48g");
    			add_location(div62, file, 248, 44, 19462);
    			attr_dev(div63, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div63, file, 246, 40, 19284);
    			attr_dev(div64, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div64, file, 242, 36, 18944);
    			attr_dev(div65, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div65, file, 241, 32, 18817);
    			attr_dev(img11, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img11.src !== (img11_src_value = "covers/cover4.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "cover");
    			add_location(img11, file, 256, 57, 19971);
    			attr_dev(a53, "href", "#");
    			attr_dev(a53, "class", "svelte-u7z48g");
    			add_location(a53, file, 256, 44, 19958);
    			attr_dev(div66, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div66, file, 255, 40, 19877);
    			attr_dev(a54, "href", "#");
    			attr_dev(a54, "class", "font-bold svelte-u7z48g");
    			add_location(a54, file, 259, 44, 20215);
    			attr_dev(div67, "class", "playlists  svelte-u7z48g");
    			add_location(div67, file, 260, 44, 20297);
    			attr_dev(div68, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div68, file, 258, 40, 20136);
    			attr_dev(div69, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div69, file, 254, 36, 19796);
    			attr_dev(div70, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div70, file, 253, 32, 19669);
    			attr_dev(div71, "id", "horiScroll");
    			attr_dev(div71, "class", "  whitespace-nowrap overflow-x-scroll overflow-y-hidden svelte-u7z48g");
    			add_location(div71, file, 191, 28, 15324);
    			attr_dev(div72, "class", "px-4 mr-4 svelte-u7z48g");
    			add_location(div72, file, 190, 24, 15270);
    			attr_dev(a55, "href", "#");
    			attr_dev(a55, "class", "leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline svelte-u7z48g");
    			add_location(a55, file, 269, 28, 20653);
    			attr_dev(a56, "href", "#");
    			attr_dev(a56, "class", "seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold svelte-u7z48g");
    			add_location(a56, file, 270, 28, 20795);
    			attr_dev(div73, "class", "flex justify-between inline-block pt-8 svelte-u7z48g");
    			add_location(div73, file, 268, 24, 20571);
    			attr_dev(img12, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img12.src !== (img12_src_value = "covers/cover0.jpg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "cover");
    			add_location(img12, file, 278, 57, 21446);
    			attr_dev(a57, "href", "#");
    			attr_dev(a57, "class", "svelte-u7z48g");
    			add_location(a57, file, 278, 44, 21433);
    			attr_dev(div74, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div74, file, 277, 40, 21352);
    			attr_dev(a58, "href", "#");
    			attr_dev(a58, "class", "font-bold svelte-u7z48g");
    			add_location(a58, file, 281, 44, 21690);
    			attr_dev(div75, "class", "playlists svelte-u7z48g");
    			add_location(div75, file, 282, 44, 21779);
    			attr_dev(div76, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div76, file, 280, 40, 21611);
    			attr_dev(div77, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div77, file, 276, 36, 21271);
    			attr_dev(div78, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div78, file, 275, 32, 21144);
    			attr_dev(img13, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img13.src !== (img13_src_value = "covers/cover1.jpg")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "cover");
    			add_location(img13, file, 290, 57, 22292);
    			attr_dev(a59, "href", "#");
    			attr_dev(a59, "class", "svelte-u7z48g");
    			add_location(a59, file, 290, 44, 22279);
    			attr_dev(div79, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div79, file, 289, 40, 22198);
    			attr_dev(a60, "href", "#");
    			attr_dev(a60, "class", "font-bold svelte-u7z48g");
    			add_location(a60, file, 293, 44, 22536);
    			attr_dev(div80, "class", "playlists svelte-u7z48g");
    			add_location(div80, file, 294, 44, 22621);
    			attr_dev(div81, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div81, file, 292, 40, 22457);
    			attr_dev(div82, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div82, file, 288, 36, 22117);
    			attr_dev(div83, "class", " inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div83, file, 287, 32, 21989);
    			attr_dev(img14, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img14.src !== (img14_src_value = "covers/cover2.jpg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "cover");
    			add_location(img14, file, 302, 57, 23132);
    			attr_dev(a61, "href", "#");
    			attr_dev(a61, "class", "svelte-u7z48g");
    			add_location(a61, file, 302, 44, 23119);
    			attr_dev(div84, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div84, file, 301, 40, 23038);
    			attr_dev(a62, "href", "#");
    			attr_dev(a62, "class", "font-bold svelte-u7z48g");
    			add_location(a62, file, 305, 44, 23376);
    			attr_dev(div85, "class", "playlists svelte-u7z48g");
    			add_location(div85, file, 306, 44, 23465);
    			attr_dev(div86, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div86, file, 304, 40, 23297);
    			attr_dev(div87, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div87, file, 300, 36, 22957);
    			attr_dev(div88, "class", " inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div88, file, 299, 32, 22829);
    			attr_dev(img15, "class", " rounded-full shadow-md svelte-u7z48g");
    			if (img15.src !== (img15_src_value = "covers/artist0.jpg")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "cover");
    			add_location(img15, file, 314, 57, 23976);
    			attr_dev(a63, "href", "#");
    			attr_dev(a63, "class", "svelte-u7z48g");
    			add_location(a63, file, 314, 44, 23963);
    			attr_dev(div89, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div89, file, 313, 40, 23882);
    			attr_dev(a64, "href", "#");
    			attr_dev(a64, "class", "font-bold  svelte-u7z48g");
    			add_location(a64, file, 317, 44, 24223);
    			attr_dev(div90, "class", "playlists svelte-u7z48g");
    			add_location(div90, file, 318, 44, 24313);
    			attr_dev(div91, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div91, file, 316, 40, 24144);
    			attr_dev(div92, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div92, file, 312, 36, 23801);
    			attr_dev(div93, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div93, file, 311, 32, 23674);
    			attr_dev(img16, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img16.src !== (img16_src_value = "covers/cover3.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "cover");
    			add_location(img16, file, 326, 57, 24818);
    			attr_dev(a65, "href", "#");
    			attr_dev(a65, "class", "svelte-u7z48g");
    			add_location(a65, file, 326, 44, 24805);
    			attr_dev(div94, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div94, file, 325, 40, 24724);
    			attr_dev(a66, "href", "#");
    			attr_dev(a66, "class", "font-bold  svelte-u7z48g");
    			add_location(a66, file, 329, 44, 25062);
    			attr_dev(div95, "class", "playlists svelte-u7z48g");
    			add_location(div95, file, 330, 44, 25161);
    			attr_dev(div96, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div96, file, 328, 40, 24983);
    			attr_dev(div97, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div97, file, 324, 36, 24643);
    			attr_dev(div98, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div98, file, 323, 32, 24516);
    			attr_dev(img17, "class", " rounded-md shadow-md svelte-u7z48g");
    			if (img17.src !== (img17_src_value = "covers/cover4.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "alt", "cover");
    			add_location(img17, file, 338, 57, 25670);
    			attr_dev(a67, "href", "#");
    			attr_dev(a67, "class", "svelte-u7z48g");
    			add_location(a67, file, 338, 44, 25657);
    			attr_dev(div99, "class", "rounded-lg card-image svelte-u7z48g");
    			add_location(div99, file, 337, 40, 25576);
    			attr_dev(a68, "href", "#");
    			attr_dev(a68, "class", "font-bold svelte-u7z48g");
    			add_location(a68, file, 341, 44, 25914);
    			attr_dev(div100, "class", "playlists  svelte-u7z48g");
    			add_location(div100, file, 342, 44, 25996);
    			attr_dev(div101, "class", "ml-5 pb-3 truncate svelte-u7z48g");
    			add_location(div101, file, 340, 40, 25835);
    			attr_dev(div102, "class", "card rounded-lg shadow-md svelte-u7z48g");
    			add_location(div102, file, 336, 36, 25495);
    			attr_dev(div103, "class", "inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2 svelte-u7z48g");
    			add_location(div103, file, 335, 32, 25368);
    			attr_dev(div104, "id", "horiScroll");
    			attr_dev(div104, "class", "  whitespace-nowrap overflow-x-scroll overflow-y-hidden svelte-u7z48g");
    			add_location(div104, file, 273, 28, 21023);
    			attr_dev(div105, "class", "px-4 mr-4 svelte-u7z48g");
    			add_location(div105, file, 272, 24, 20969);
    			attr_dev(div106, "class", "mx-auto svelte-u7z48g");
    			add_location(div106, file, 103, 20, 9222);
    			attr_dev(div107, "class", "overflow-y-auto  svelte-u7z48g");
    			add_location(div107, file, 101, 16, 9168);
    			attr_dev(div108, "class", "mainScreen flex-1 flex flex-col text-white svelte-u7z48g");
    			add_location(div108, file, 80, 12, 7079);
    			attr_dev(div109, "class", "flex flex-1 overflow-y-hidden overflow-x-hidden svelte-u7z48g");
    			add_location(div109, file, 6, 8, 120);
    			if (img18.src !== (img18_src_value = "covers/cover5.jpg")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "class", "w-12 h-12 shadow-lg svelte-u7z48g");
    			add_location(img18, file, 358, 28, 26498);
    			attr_dev(a69, "href", "#");
    			attr_dev(a69, "class", "svelte-u7z48g");
    			add_location(a69, file, 358, 16, 26486);
    			attr_dev(a70, "href", "#");
    			attr_dev(a70, "class", "hover:underline text-white svelte-u7z48g");
    			add_location(a70, file, 360, 21, 26631);
    			attr_dev(div110, "class", "svelte-u7z48g");
    			add_location(div110, file, 360, 16, 26626);
    			attr_dev(a71, "href", "#");
    			attr_dev(a71, "class", "hover:underline hover:text-white playlists text-xs svelte-u7z48g");
    			add_location(a71, file, 361, 21, 26729);
    			attr_dev(div111, "class", "svelte-u7z48g");
    			add_location(div111, file, 361, 16, 26724);
    			attr_dev(div112, "class", "ml-4 leading-none svelte-u7z48g");
    			add_location(div112, file, 359, 16, 26577);
    			attr_dev(div113, "class", "flex items-center svelte-u7z48g");
    			add_location(div113, file, 357, 12, 26437);
    			attr_dev(path10, "d", "M370.1,181.3H399v47.3l81-83.2L399,64v54h-28.9c-82.7,0-129.4,61.9-170.6,116.5c-37,49.1-69,95.4-120.6,95.4H32v63.3h46.9 c82.7,0,129.4-65.8,170.6-120.4C286.5,223.7,318.4,181.3,370.1,181.3z M153.2,217.5c3.5-4.6,7.1-9.3,10.7-14.1 c8.8-11.6,18-23.9,28-36.1c-29.6-27.9-65.3-48.5-113-48.5H32v63.3c0,0,13.3-0.6,46.9,0C111.4,182.8,131.8,196.2,153.2,217.5z M399,330.4h-28.9c-31.5,0-55.7-15.8-78.2-39.3c-2.2,3-4.5,6-6.8,9c-9.9,13.1-20.5,27.2-32.2,41.1c30.4,29.9,67.2,52.5,117.2,52.5 H399V448l81-81.4l-81-83.2V330.4z");
    			attr_dev(path10, "class", "svelte-u7z48g");
    			add_location(path10, file, 369, 228, 27241);
    			attr_dev(svg10, "class", "fill-current playlists hover:text-white svelte-u7z48g");
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg10, "width", "16");
    			attr_dev(svg10, "height", "16");
    			attr_dev(svg10, "enable-background", "new 0 0 512 512");
    			attr_dev(svg10, "version", "1.1");
    			attr_dev(svg10, "viewBox", "0 0 512 512");
    			attr_dev(svg10, "xml:space", "preserve");
    			add_location(svg10, file, 369, 24, 27037);
    			attr_dev(button4, "class", "svelte-u7z48g");
    			add_location(button4, file, 368, 20, 27003);
    			attr_dev(path11, "d", "M31.5350008,15.0036284 L17.8240107,7.18215392 C17.6148869,7.06285864 17.3771339,7 17.135042,7 C16.3797696,7 15.7675004,7.59886165 15.7675004,8.33759493 L15.7675004,15.0036284 L2.05651029,7.18215392 C1.8473865,7.06285864 1.60963353,7 1.36754162,7 C0.612269239,7 0,7.59886165 0,8.33759493 L0,27.0609378 C0,27.2977283 0.0642659496,27.5302749 0.186232067,27.7348193 C0.566738954,28.3729517 1.40409104,28.5885533 2.05651029,28.2163788 L15.7675004,20.3949043 L15.7675004,27.0609378 C15.7675004,27.2977283 15.8317664,27.5302749 15.9537325,27.7348193 C16.3342394,28.3729517 17.1715914,28.5885533 17.8240107,28.2163788 L31.5350008,20.3949043 L31.5350008,26.1462505 C31.5350008,27.3902719 32.5434794,28.3987505 33.7875009,28.3987505 C35.0315223,28.3987505 36.0400009,27.3902719 36.0400009,26.1462505 L36.0400009,9.25250006 C36.0400009,8.00847863 35.0315223,7 33.7875009,7 C32.5434794,7 31.5350008,8.00847863 31.5350008,9.25250006 L31.5350008,15.0036284 L31.5350008,15.0036284 Z");
    			attr_dev(path11, "transform", "translate(709.000000, 279.000000) translate(18.020000, 17.699375) scale(-1, 1) translate(-18.020000, -17.699375)");
    			attr_dev(path11, "class", "svelte-u7z48g");
    			add_location(path11, file, 372, 297, 28135);
    			attr_dev(g0, "fill", "#FF39AA");
    			attr_dev(g0, "transform", "translate(-709.000000, -286.000000)");
    			attr_dev(g0, "class", "svelte-u7z48g");
    			add_location(g0, file, 372, 231, 28069);
    			attr_dev(g1, "fill", "none");
    			attr_dev(g1, "fill-rule", "evenodd");
    			attr_dev(g1, "stroke", "none");
    			attr_dev(g1, "stroke-width", "1");
    			attr_dev(g1, "class", "svelte-u7z48g");
    			add_location(g1, file, 372, 165, 28003);
    			attr_dev(svg11, "class", "svg-color fill-current playlists hover:text-white svelte-u7z48g");
    			attr_dev(svg11, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg11, "width", "16");
    			attr_dev(svg11, "height", "16");
    			attr_dev(svg11, "viewBox", "0 0 37 22");
    			add_location(svg11, file, 372, 24, 27862);
    			attr_dev(button5, "class", "ml-8 svelte-u7z48g");
    			add_location(button5, file, 371, 20, 27815);
    			attr_dev(path12, "stroke-linecap", "round");
    			attr_dev(path12, "stroke-linejoin", "round");
    			attr_dev(path12, "stroke-width", "2");
    			attr_dev(path12, "d", "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z");
    			attr_dev(path12, "class", "svelte-u7z48g");
    			add_location(path12, file, 375, 177, 29507);
    			attr_dev(path13, "stroke-linecap", "round");
    			attr_dev(path13, "stroke-linejoin", "round");
    			attr_dev(path13, "stroke-width", "2");
    			attr_dev(path13, "d", "M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			attr_dev(path13, "class", "svelte-u7z48g");
    			add_location(path13, file, 375, 349, 29679);
    			attr_dev(svg12, "class", "svg-color hover:text-white svelte-u7z48g");
    			attr_dev(svg12, "width", "36");
    			attr_dev(svg12, "height", "36");
    			attr_dev(svg12, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg12, "fill", "none");
    			attr_dev(svg12, "stroke", "currentColor");
    			attr_dev(svg12, "viewBox", "0 0 24 24");
    			add_location(svg12, file, 375, 24, 29354);
    			attr_dev(button6, "class", "ml-8 svelte-u7z48g");
    			add_location(button6, file, 374, 20, 29306);
    			attr_dev(path14, "d", "M17.8042278,7.18195175 C17.5953361,7.06278887 17.357847,7 17.1160238,7 C16.3615897,7 15.75,7.59819697 15.75,8.33611033 L15.75,14.9947452 L2.05422776,7.18195175 C1.84533608,7.06278887 1.607847,7 1.36602378,7 C0.61158968,7 0,7.59819697 0,8.33611033 L0,27.0386721 C0,27.2751998 0.0641946206,27.5074883 0.186025367,27.7118056 C0.566109929,28.3492298 1.40253263,28.564592 2.05422776,28.1928307 L15.75,20.3800372 L15.75,27.0386721 C15.75,27.2751998 15.8141946,27.5074883 15.9360254,27.7118056 C16.3161099,28.3492298 17.1525326,28.564592 17.8042278,28.1928307 L31.5,20.3800372 L31.5,26.125 C31.5,27.3676407 32.5073593,28.375 33.75,28.375 C34.9926407,28.375 36,27.3676407 36,26.125 L36,9.25 C36,8.00735931 34.9926407,7 33.75,7 C32.5073593,7 31.5,8.00735931 31.5,9.25 L31.5,14.9947452 L17.8042278,7.18195175 Z");
    			attr_dev(path14, "transform", "translate(558.000000, 279.000000)");
    			attr_dev(path14, "class", "svelte-u7z48g");
    			add_location(path14, file, 378, 298, 30171);
    			attr_dev(g2, "fill", "#FF39AA");
    			attr_dev(g2, "transform", "translate(-558.000000, -286.000000)");
    			attr_dev(g2, "class", "svelte-u7z48g");
    			add_location(g2, file, 378, 232, 30105);
    			attr_dev(g3, "fill", "none");
    			attr_dev(g3, "fill-rule", "evenodd");
    			attr_dev(g3, "stroke", "none");
    			attr_dev(g3, "stroke-width", "1");
    			attr_dev(g3, "class", "svelte-u7z48g");
    			add_location(g3, file, 378, 166, 30039);
    			attr_dev(svg13, "class", "svg-color fill-current playlists hover:text-white svelte-u7z48g");
    			attr_dev(svg13, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg13, "width", "16");
    			attr_dev(svg13, "height", "16");
    			attr_dev(svg13, "viewBox", "0 0 36 22");
    			add_location(svg13, file, 378, 24, 29897);
    			attr_dev(button7, "class", "ml-8 svelte-u7z48g");
    			add_location(button7, file, 377, 20, 29849);
    			attr_dev(path15, "d", "M8.64,25.9710983 L19.2030566,25.9710983 C28.1531421,25.9710983 32.16,22.7468816 32.16,16 L36,16 C36,25.2145828 30.0888956,29.9710983 19.2030566,29.9710983 L8.64,29.9710983 L8.64,33 L5.68434189e-14,28 L8.64,23 L8.64,25.9710983 Z M27.36,10.0289017 L16.7969434,10.0289017 C7.84685788,10.0289017 3.84,13.2531184 3.84,20 L0,20 C0,10.7854172 5.91110441,6.02890173 16.7969434,6.02890173 L27.36,6.02890173 L27.36,3 L36,8 L27.36,13 L27.36,10.0289017 Z");
    			attr_dev(path15, "transform", "translate(256.000000, 279.000000)");
    			attr_dev(path15, "class", "svelte-u7z48g");
    			add_location(path15, file, 381, 318, 31438);
    			attr_dev(g4, "fill", "#FF39AA");
    			attr_dev(g4, "fill-rule", "nonzero");
    			attr_dev(g4, "transform", "translate(-256.000000, -282.000000)");
    			attr_dev(g4, "class", "svelte-u7z48g");
    			add_location(g4, file, 381, 232, 31352);
    			attr_dev(g5, "fill", "none");
    			attr_dev(g5, "fill-rule", "evenodd");
    			attr_dev(g5, "stroke", "none");
    			attr_dev(g5, "stroke-width", "1");
    			attr_dev(g5, "class", "svelte-u7z48g");
    			add_location(g5, file, 381, 166, 31286);
    			attr_dev(svg14, "class", "svg-color fill-current playlists hover:text-white svelte-u7z48g");
    			attr_dev(svg14, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg14, "width", "16");
    			attr_dev(svg14, "height", "16");
    			attr_dev(svg14, "viewBox", "0 0 36 30");
    			add_location(svg14, file, 381, 24, 31144);
    			attr_dev(button8, "class", "ml-8 svelte-u7z48g");
    			add_location(button8, file, 380, 20, 31096);
    			attr_dev(div114, "class", "flex justify-center mt-1 svelte-u7z48g");
    			add_location(div114, file, 367, 16, 26943);
    			attr_dev(div115, "class", "text-xs playlists svelte-u7z48g");
    			add_location(div115, file, 385, 20, 32110);
    			attr_dev(div116, "class", "play-color rounded-lg w-full h-1 ml-3 xl:w-96 svelte-u7z48g");
    			add_location(div116, file, 386, 20, 32173);
    			attr_dev(div117, "class", "ml-2 text-xs playlists svelte-u7z48g");
    			add_location(div117, file, 387, 20, 32260);
    			attr_dev(div118, "class", "flex items-center justify-center max-w-full mt-2  svelte-u7z48g");
    			add_location(div118, file, 384, 16, 32025);
    			attr_dev(div119, "class", "flex flex-col justify-center svelte-u7z48g");
    			add_location(div119, file, 366, 12, 26883);
    			attr_dev(path16, "d", "M18.1946151,7.57330547 L33.8762935,7.57330547 C34.980863,7.57330547 35.8762935,8.46873597 35.8762935,9.57330547 C35.8762935,10.677875 34.980863,11.5733055 33.8762935,11.5733055 L16.2281832,11.5733055 L18.2729987,10.380719 C18.511274,10.241751 18.7095348,10.0434902 18.8485028,9.80521486 C19.2932826,9.04259295 19.0356206,8.06380048 18.2729987,7.61902071 L18.1946151,7.57330547 Z M3.87629351,33.5733055 C3.87629351,32.468736 4.77172401,31.5733055 5.87629351,31.5733055 L33.8762935,31.5733055 C34.980863,31.5733055 35.8762935,32.468736 35.8762935,33.5733055 C35.8762935,34.677875 34.980863,35.5733055 33.8762935,35.5733055 L5.87629351,35.5733055 C4.77172401,35.5733055 3.87629351,34.677875 3.87629351,33.5733055 Z M3.87629351,21.5733055 C3.87629351,20.468736 4.77172401,19.5733055 5.87629351,19.5733055 L33.8762935,19.5733055 C34.980863,19.5733055 35.8762935,20.468736 35.8762935,21.5733055 C35.8762935,22.677875 34.980863,23.5733055 33.8762935,23.5733055 L5.87629351,23.5733055 C4.77172401,23.5733055 3.87629351,22.677875 3.87629351,21.5733055 Z M15.1941076,9.9718314 L1.69199485,17.8465942 C1.15521659,18.1596565 0.466284754,17.9782988 0.153222525,17.4415205 C0.0528748417,17.2694638 0,17.0738525 0,16.8746712 L0,1.12514554 C0,0.503744818 0.503744818,0 1.12514554,0 C1.32432678,0 1.51993815,0.0528748417 1.69199485,0.153222525 L15.1941076,8.02798536 C15.7308858,8.34104759 15.9122435,9.02997943 15.5991813,9.56675769 C15.5013674,9.73446991 15.3618198,9.87401752 15.1941076,9.9718314 Z");
    			attr_dev(path16, "transform", "translate(860.000000, 465.000000)");
    			attr_dev(path16, "class", "svelte-u7z48g");
    			add_location(path16, file, 392, 257, 32716);
    			attr_dev(g6, "fill", "#FF39AA");
    			attr_dev(g6, "transform", "translate(-860.000000, -465.000000)");
    			attr_dev(g6, "class", "svelte-u7z48g");
    			add_location(g6, file, 392, 191, 32650);
    			attr_dev(g7, "fill", "none");
    			attr_dev(g7, "fill-rule", "evenodd");
    			attr_dev(g7, "stroke", "none");
    			attr_dev(g7, "stroke-width", "1");
    			attr_dev(g7, "class", "svelte-u7z48g");
    			add_location(g7, file, 392, 125, 32584);
    			attr_dev(svg15, "class", "svg-color svelte-u7z48g");
    			attr_dev(svg15, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg15, "width", "14");
    			attr_dev(svg15, "height", "14");
    			attr_dev(svg15, "viewBox", "0 0 36 36");
    			add_location(svg15, file, 392, 24, 32483);
    			attr_dev(button9, "class", "mb-1 svelte-u7z48g");
    			add_location(button9, file, 391, 20, 32436);
    			attr_dev(path17, "stroke-linecap", "round");
    			attr_dev(path17, "stroke-linejoin", "round");
    			attr_dev(path17, "stroke-width", "2");
    			attr_dev(path17, "d", "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z");
    			attr_dev(path17, "class", "svelte-u7z48g");
    			add_location(path17, file, 395, 159, 34507);
    			attr_dev(svg16, "class", "svg-color svelte-u7z48g");
    			attr_dev(svg16, "width", "18");
    			attr_dev(svg16, "height", "18");
    			attr_dev(svg16, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg16, "fill", "none");
    			attr_dev(svg16, "stroke", "currentColor");
    			attr_dev(svg16, "viewBox", "0 0 24 24");
    			add_location(svg16, file, 395, 24, 34372);
    			attr_dev(button10, "class", "ml-4 svelte-u7z48g");
    			add_location(button10, file, 394, 20, 34325);
    			attr_dev(path18, "stroke-linecap", "round");
    			attr_dev(path18, "stroke-linejoin", "round");
    			attr_dev(path18, "stroke-width", "2");
    			attr_dev(path18, "d", "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z");
    			attr_dev(path18, "class", "svelte-u7z48g");
    			add_location(path18, file, 398, 159, 34929);
    			attr_dev(svg17, "class", "svg-color svelte-u7z48g");
    			attr_dev(svg17, "width", "18");
    			attr_dev(svg17, "height", "18");
    			attr_dev(svg17, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg17, "fill", "none");
    			attr_dev(svg17, "stroke", "currentColor");
    			attr_dev(svg17, "viewBox", "0 0 24 24");
    			add_location(svg17, file, 398, 24, 34794);
    			attr_dev(button11, "class", "ml-4 svelte-u7z48g");
    			add_location(button11, file, 397, 20, 34747);
    			attr_dev(div120, "class", "play-color rounded-lg w-24 h-1 ml-4 svelte-u7z48g");
    			add_location(div120, file, 400, 20, 35246);
    			attr_dev(div121, "class", "flex items-center justify-center svelte-u7z48g");
    			add_location(div121, file, 390, 16, 32368);
    			attr_dev(div122, "class", "bottomBar flex-none h-22 px-5 flex items-center justify-between svelte-u7z48g");
    			add_location(div122, file, 356, 8, 26346);
    			attr_dev(div123, "class", "flex flex-col h-screen svelte-u7z48g");
    			add_location(div123, file, 5, 4, 74);
    			attr_dev(main, "class", "svelte-u7z48g");
    			add_location(main, file, 4, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div123);
    			append_dev(div123, div109);
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
    			append_dev(ul3, t45);
    			append_dev(ul3, li20);
    			append_dev(li20, a20);
    			append_dev(ul3, t47);
    			append_dev(ul3, li21);
    			append_dev(li21, a21);
    			append_dev(ul3, t49);
    			append_dev(ul3, li22);
    			append_dev(li22, a22);
    			append_dev(ul3, t51);
    			append_dev(ul3, li23);
    			append_dev(li23, a23);
    			append_dev(ul3, t53);
    			append_dev(ul3, li24);
    			append_dev(li24, a24);
    			append_dev(div3, t55);
    			append_dev(div3, div2);
    			append_dev(div2, svg5);
    			append_dev(svg5, path5);
    			append_dev(div2, t56);
    			append_dev(div2, a25);
    			append_dev(div109, t58);
    			append_dev(div109, div108);
    			append_dev(div108, div6);
    			append_dev(div6, div4);
    			append_dev(div4, button0);
    			append_dev(button0, svg6);
    			append_dev(svg6, path6);
    			append_dev(div4, t59);
    			append_dev(div4, button1);
    			append_dev(button1, svg7);
    			append_dev(svg7, path7);
    			append_dev(div6, t60);
    			append_dev(div6, div5);
    			append_dev(div5, button2);
    			append_dev(button2, svg8);
    			append_dev(svg8, path8);
    			append_dev(div5, t61);
    			append_dev(div5, a26);
    			append_dev(div5, t63);
    			append_dev(div5, button3);
    			append_dev(button3, svg9);
    			append_dev(svg9, path9);
    			append_dev(div108, t64);
    			append_dev(div108, div107);
    			append_dev(div107, div106);
    			append_dev(div106, div7);
    			append_dev(div7, a27);
    			append_dev(div7, t66);
    			append_dev(div7, a28);
    			append_dev(div106, t68);
    			append_dev(div106, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div8);
    			append_dev(div8, a29);
    			append_dev(a29, img0);
    			append_dev(div11, t69);
    			append_dev(div11, div10);
    			append_dev(div10, a30);
    			append_dev(div10, t71);
    			append_dev(div10, div9);
    			append_dev(div38, t73);
    			append_dev(div38, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div13);
    			append_dev(div13, a31);
    			append_dev(a31, img1);
    			append_dev(div16, t74);
    			append_dev(div16, div15);
    			append_dev(div15, a32);
    			append_dev(div15, t76);
    			append_dev(div15, div14);
    			append_dev(div38, t78);
    			append_dev(div38, div22);
    			append_dev(div22, div21);
    			append_dev(div21, div18);
    			append_dev(div18, a33);
    			append_dev(a33, img2);
    			append_dev(div21, t79);
    			append_dev(div21, div20);
    			append_dev(div20, a34);
    			append_dev(div20, t81);
    			append_dev(div20, div19);
    			append_dev(div38, t83);
    			append_dev(div38, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div23);
    			append_dev(div23, a35);
    			append_dev(a35, img3);
    			append_dev(div26, t84);
    			append_dev(div26, div25);
    			append_dev(div25, a36);
    			append_dev(div25, t86);
    			append_dev(div25, div24);
    			append_dev(div38, t88);
    			append_dev(div38, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div28);
    			append_dev(div28, a37);
    			append_dev(a37, img4);
    			append_dev(div31, t89);
    			append_dev(div31, div30);
    			append_dev(div30, a38);
    			append_dev(div30, t91);
    			append_dev(div30, div29);
    			append_dev(div38, t93);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div33);
    			append_dev(div33, a39);
    			append_dev(a39, img5);
    			append_dev(div36, t94);
    			append_dev(div36, div35);
    			append_dev(div35, a40);
    			append_dev(div35, t96);
    			append_dev(div35, div34);
    			append_dev(div106, t98);
    			append_dev(div106, div40);
    			append_dev(div40, a41);
    			append_dev(div40, t100);
    			append_dev(div40, a42);
    			append_dev(div106, t102);
    			append_dev(div106, div72);
    			append_dev(div72, div71);
    			append_dev(div71, div45);
    			append_dev(div45, div44);
    			append_dev(div44, div41);
    			append_dev(div41, a43);
    			append_dev(a43, img6);
    			append_dev(div44, t103);
    			append_dev(div44, div43);
    			append_dev(div43, a44);
    			append_dev(div43, t105);
    			append_dev(div43, div42);
    			append_dev(div71, t107);
    			append_dev(div71, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div46);
    			append_dev(div46, a45);
    			append_dev(a45, img7);
    			append_dev(div49, t108);
    			append_dev(div49, div48);
    			append_dev(div48, a46);
    			append_dev(div48, t110);
    			append_dev(div48, div47);
    			append_dev(div71, t112);
    			append_dev(div71, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div51);
    			append_dev(div51, a47);
    			append_dev(a47, img8);
    			append_dev(div54, t113);
    			append_dev(div54, div53);
    			append_dev(div53, a48);
    			append_dev(div53, t115);
    			append_dev(div53, div52);
    			append_dev(div71, t117);
    			append_dev(div71, div60);
    			append_dev(div60, div59);
    			append_dev(div59, div56);
    			append_dev(div56, a49);
    			append_dev(a49, img9);
    			append_dev(div59, t118);
    			append_dev(div59, div58);
    			append_dev(div58, a50);
    			append_dev(div58, t120);
    			append_dev(div58, div57);
    			append_dev(div71, t122);
    			append_dev(div71, div65);
    			append_dev(div65, div64);
    			append_dev(div64, div61);
    			append_dev(div61, a51);
    			append_dev(a51, img10);
    			append_dev(div64, t123);
    			append_dev(div64, div63);
    			append_dev(div63, a52);
    			append_dev(div63, t125);
    			append_dev(div63, div62);
    			append_dev(div71, t127);
    			append_dev(div71, div70);
    			append_dev(div70, div69);
    			append_dev(div69, div66);
    			append_dev(div66, a53);
    			append_dev(a53, img11);
    			append_dev(div69, t128);
    			append_dev(div69, div68);
    			append_dev(div68, a54);
    			append_dev(div68, t130);
    			append_dev(div68, div67);
    			append_dev(div106, t132);
    			append_dev(div106, div73);
    			append_dev(div73, a55);
    			append_dev(div73, t134);
    			append_dev(div73, a56);
    			append_dev(div106, t136);
    			append_dev(div106, div105);
    			append_dev(div105, div104);
    			append_dev(div104, div78);
    			append_dev(div78, div77);
    			append_dev(div77, div74);
    			append_dev(div74, a57);
    			append_dev(a57, img12);
    			append_dev(div77, t137);
    			append_dev(div77, div76);
    			append_dev(div76, a58);
    			append_dev(div76, t139);
    			append_dev(div76, div75);
    			append_dev(div104, t141);
    			append_dev(div104, div83);
    			append_dev(div83, div82);
    			append_dev(div82, div79);
    			append_dev(div79, a59);
    			append_dev(a59, img13);
    			append_dev(div82, t142);
    			append_dev(div82, div81);
    			append_dev(div81, a60);
    			append_dev(div81, t144);
    			append_dev(div81, div80);
    			append_dev(div104, t146);
    			append_dev(div104, div88);
    			append_dev(div88, div87);
    			append_dev(div87, div84);
    			append_dev(div84, a61);
    			append_dev(a61, img14);
    			append_dev(div87, t147);
    			append_dev(div87, div86);
    			append_dev(div86, a62);
    			append_dev(div86, t149);
    			append_dev(div86, div85);
    			append_dev(div104, t151);
    			append_dev(div104, div93);
    			append_dev(div93, div92);
    			append_dev(div92, div89);
    			append_dev(div89, a63);
    			append_dev(a63, img15);
    			append_dev(div92, t152);
    			append_dev(div92, div91);
    			append_dev(div91, a64);
    			append_dev(div91, t154);
    			append_dev(div91, div90);
    			append_dev(div104, t156);
    			append_dev(div104, div98);
    			append_dev(div98, div97);
    			append_dev(div97, div94);
    			append_dev(div94, a65);
    			append_dev(a65, img16);
    			append_dev(div97, t157);
    			append_dev(div97, div96);
    			append_dev(div96, a66);
    			append_dev(div96, t159);
    			append_dev(div96, div95);
    			append_dev(div104, t161);
    			append_dev(div104, div103);
    			append_dev(div103, div102);
    			append_dev(div102, div99);
    			append_dev(div99, a67);
    			append_dev(a67, img17);
    			append_dev(div102, t162);
    			append_dev(div102, div101);
    			append_dev(div101, a68);
    			append_dev(div101, t164);
    			append_dev(div101, div100);
    			append_dev(div123, t166);
    			append_dev(div123, div122);
    			append_dev(div122, div113);
    			append_dev(div113, a69);
    			append_dev(a69, img18);
    			append_dev(div113, t167);
    			append_dev(div113, div112);
    			append_dev(div112, div110);
    			append_dev(div110, a70);
    			append_dev(div112, t169);
    			append_dev(div112, div111);
    			append_dev(div111, a71);
    			append_dev(div122, t171);
    			append_dev(div122, div119);
    			append_dev(div119, div114);
    			append_dev(div114, button4);
    			append_dev(button4, svg10);
    			append_dev(svg10, path10);
    			append_dev(div114, t172);
    			append_dev(div114, button5);
    			append_dev(button5, svg11);
    			append_dev(svg11, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path11);
    			append_dev(div114, t173);
    			append_dev(div114, button6);
    			append_dev(button6, svg12);
    			append_dev(svg12, path12);
    			append_dev(svg12, path13);
    			append_dev(div114, t174);
    			append_dev(div114, button7);
    			append_dev(button7, svg13);
    			append_dev(svg13, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path14);
    			append_dev(div114, t175);
    			append_dev(div114, button8);
    			append_dev(button8, svg14);
    			append_dev(svg14, g5);
    			append_dev(g5, g4);
    			append_dev(g4, path15);
    			append_dev(div119, t176);
    			append_dev(div119, div118);
    			append_dev(div118, div115);
    			append_dev(div118, t178);
    			append_dev(div118, div116);
    			append_dev(div118, t179);
    			append_dev(div118, div117);
    			append_dev(div122, t181);
    			append_dev(div122, div121);
    			append_dev(div121, button9);
    			append_dev(button9, svg15);
    			append_dev(svg15, g7);
    			append_dev(g7, g6);
    			append_dev(g6, path16);
    			append_dev(div121, t182);
    			append_dev(div121, button10);
    			append_dev(button10, svg16);
    			append_dev(svg16, path17);
    			append_dev(div121, t183);
    			append_dev(div121, button11);
    			append_dev(button11, svg17);
    			append_dev(svg17, path18);
    			append_dev(div121, t184);
    			append_dev(div121, div120);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spotify_UI", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spotify_UI> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ App });
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
