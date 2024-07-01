class HTMLVElement extends Object {
  #value;
  constructor(value, variables) {
    super();
    this.#value = value;
    Object.assign(this, variables);
    Object.setPrototypeOf(Object.getPrototypeOf(this), null);
  }
  *[Symbol.iterator]() {
    yield* this.#value;
  }
}
function htmlv(string, ...args) {
  if(!string) return;
  let i = 0;
  const temp = [];
  args = args.map(v => {
    if(Array.isArray(v)) {
      if(v[0] instanceof HTMLVElement) {
        v = v.map(e => {
          temp[i] = e;
          return `<use *v="${i++}"></use>`;
        });
      }
      return v.join('');
    }
    if(typeof v == 'string') {
      return v.replaceAll('\n', '<br>');
    }
    if(v instanceof HTMLVElement) {
      temp[i] = v;
      return `<use *v="${i++}"></use>`;
    }
    if(v instanceof Function) {
      temp[i] = v;
      return `"${i++}"`;
    }
    if(Object.prototype.toString(v) == '[object Object]' && v.constructor == Object) {
      return `"${Object.entries(v).map(v => {
        v[0] = v[0].replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        v[1] = (typeof v[1] == 'number' ? v[1] + 'px' : v[1]);
        return v.join(':');
      }).join(';')}"`;
    }
    return v;
  });
  string = string.flatMap((v, i) => (args[i] || args[i] == 0) ? [v, args[i]] : [v]).join('');
  
  const template = document.createElement('template');
  template.innerHTML = string;
  const doc = template.content;
  
  const variables = {};
  doc.querySelectorAll('[\\*as]').forEach(v => {
    const n = v.getAttribute('*as');
    const result = [];
    n.replace(/^([a-z_$][\w$]*)((?:\[[\w$]+\])*)$/, (_, base, indicesString) => {
      result.push(base);
      indicesString.replace(/\[(\w+)\]/g, (_, index) => {
        result.push(index);
      });
    });
    result.push(null);
    let tmp = variables;
    result.reduce((a, b) => {
      if(!b) {
        tmp[a] = v;
        return;
      }
      if(!(a in tmp)) {
        tmp[a] = isNaN(+b) ? {} : [];
      }
      tmp = tmp[a];
      return b;
    });
    v.removeAttribute('*as');
  });
  
  const events = 'auxclick,blur,click,compositionend,compositionstart,compositionupdate,contextmenu,copy,cut,dblclick,error,focusin,focusout,focus,change,fullscreenchange,fullscreenerror,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,mousewheel,paste,scroll,select,selectend,selectstart,touchcancel,touchend,touchmove,touchstart'.split(',');
  events.forEach(e => {
    if(!string.includes(e)) return;
    doc.querySelectorAll(`[\\*on${e}]`).forEach(v => {
      v.addEventListener(e, temp[v.getAttribute(`*on${e}`)]);
      v.removeAttribute(`*on${e}`);
    });
  });
  
  Object.entries(htmlv.functions).forEach(f => {
    if(!string.includes(f)) return;
    doc.querySelectorAll(`${f[0]}\\*`).forEach(v => {
      let velm = f[1];
      if(typeof velm == 'function') {
        const props = Array.from(v.attributes).reduce((o, p) => (o[p.name] = p.value, o), {});
        velm = f[1](props, v.innerHTML.trim());
      }
      v.before(...velm);
      v.remove();
      Object.assign(variables, velm);
    });
  });
  
  doc.querySelectorAll('use').forEach(v => {
    const velm = temp[v.getAttribute('*v')];
    v.before(...velm);
    v.remove();
    Object.assign(variables, velm);
  });
  return new HTMLVElement([...doc.childNodes].filter(v => {
    if(v.nodeType == 3) {
      return v.nodeValue.trim();
    } else {
      return true;
    }
  }), variables);
}
Object.assign(htmlv, {
  functions: {}
}),
Object.setPrototypeOf(htmlv, {
  set(func) {
    Object.assign(this.functions, func);
  },
  remove(func) {
    Object.keys(func).forEach(f => delete this.functions[f]);
  },
  reset() {
    this.functions = {};
  }
});
function sanitize(s) {
  return s
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}
function sanitizeURI(s) {
  return encodeURIComponent(s);
}
function sanitizeAttr(s) {
  return s
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\'', '\\\'');
}
