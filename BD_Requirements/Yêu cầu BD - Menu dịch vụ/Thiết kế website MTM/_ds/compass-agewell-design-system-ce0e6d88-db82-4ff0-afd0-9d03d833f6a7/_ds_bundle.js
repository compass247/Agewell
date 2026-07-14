/* @ds-bundle: {"format":3,"namespace":"CompassAgeWellDesignSystem_ce0e6d","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"3c6f01334b4e","components/core/Badge.jsx":"ec693ca38c29","components/core/Button.jsx":"481882bd60b6","components/core/Card.jsx":"043305118da4","components/core/IconButton.jsx":"b48798f4e29f","components/feedback/Alert.jsx":"654e27c4200c","components/forms/Input.jsx":"b261a050e936","components/forms/Switch.jsx":"15f47586a0db","ui_kits/icons.jsx":"966b8c4302fc","ui_kits/portal/app.jsx":"156567ac5a37","ui_kits/website/sections.jsx":"0177ac9ca52b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CompassAgeWellDesignSystem_ce0e6d = window.CompassAgeWellDesignSystem_ce0e6d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular avatar. Pass src for a photo, else initials render on a tinted disc. */
function Avatar({
  src,
  name = '',
  size = 48,
  tone = 'green',
  style = {},
  ...rest
}) {
  const tones = {
    green: {
      background: 'var(--green-100)',
      color: 'var(--green-700)'
    },
    blue: {
      background: 'var(--blue-100)',
      color: 'var(--blue-700)'
    },
    orange: {
      background: 'var(--orange-100)',
      color: 'var(--orange-700)'
    }
  };
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const t = tones[tone] || tones.green;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flex: 'none',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-bold)',
      fontSize: size * 0.4,
      ...t,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '?');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  green: {
    background: 'var(--green-100)',
    color: 'var(--green-700)'
  },
  blue: {
    background: 'var(--blue-100)',
    color: 'var(--blue-700)'
  },
  orange: {
    background: 'var(--orange-100)',
    color: 'var(--orange-700)'
  },
  neutral: {
    background: 'var(--gray-200)',
    color: 'var(--ink-700)'
  },
  success: {
    background: 'var(--success-soft)',
    color: 'var(--green-700)'
  },
  warning: {
    background: 'var(--warning-soft)',
    color: 'var(--orange-700)'
  },
  danger: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)'
  }
};

/** A small status / category pill. Soft tinted fill, bold label. */
function Badge({
  children,
  tone = 'green',
  solid = false,
  style = {},
  ...rest
}) {
  const t = tones[tone] || tones.green;
  const look = solid ? {
    background: t.color,
    color: 'var(--white)'
  } : t;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--text-xs)',
      lineHeight: 1,
      letterSpacing: '0.02em',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      ...look,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 18px',
    fontSize: 'var(--text-sm)'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 24px',
    fontSize: 'var(--text-base)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 32px',
    fontSize: 'var(--text-lg)'
  }
};
const variants = {
  primary: {
    background: 'var(--green-500)',
    color: 'var(--white)',
    border: '2px solid var(--green-500)',
    boxShadow: 'var(--shadow-brand)'
  },
  secondary: {
    background: 'var(--blue-500)',
    color: 'var(--white)',
    border: '2px solid var(--blue-500)'
  },
  outline: {
    background: 'transparent',
    color: 'var(--green-700)',
    border: '2px solid var(--green-500)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--green-700)',
    border: '2px solid transparent'
  }
};

/**
 * Primary call-to-action button. Pill-shaped, large tap target, brand green by default.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--weight-bold)',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    transition: 'transform var(--duration-fast) var(--ease-standard), filter var(--duration-base) var(--ease-standard)',
    opacity: disabled ? 0.45 : 1,
    transform: hover && !disabled ? 'translateY(-1px)' : 'none',
    filter: hover && !disabled ? 'brightness(0.94)' : 'none'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** A surface container with soft radius + shadow. Set interactive for hover lift. */
function Card({
  children,
  interactive = false,
  padding = 'var(--space-6)',
  style = {},
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover && interactive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      padding,
      cursor: interactive ? 'pointer' : 'default',
      transform: hover && interactive ? 'translateY(-2px)' : 'none',
      transition: 'transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** A square icon-only button — used in toolbars, cards, and dense controls. */
function IconButton({
  children,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = size === 'sm' ? 40 : size === 'lg' ? 56 : 48;
  const variants = {
    solid: {
      background: 'var(--green-500)',
      color: 'var(--white)'
    },
    soft: {
      background: 'var(--green-100)',
      color: 'var(--green-700)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-700)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dim,
      height: dim,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--duration-base) var(--ease-standard), filter var(--duration-base)',
      filter: hover && !disabled ? 'brightness(0.92)' : 'none',
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  info: {
    bg: 'var(--info-soft)',
    bar: 'var(--blue-500)',
    text: 'var(--blue-700)'
  },
  success: {
    bg: 'var(--success-soft)',
    bar: 'var(--green-500)',
    text: 'var(--green-700)'
  },
  warning: {
    bg: 'var(--warning-soft)',
    bar: 'var(--orange-500)',
    text: 'var(--orange-700)'
  },
  danger: {
    bg: 'var(--danger-soft)',
    bar: 'var(--danger)',
    text: 'var(--danger)'
  }
};

/** An inline message banner with a colored leading bar and optional icon. */
function Alert({
  tone = 'info',
  title,
  children,
  icon = null,
  style = {},
  ...rest
}) {
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
      background: t.bg,
      borderRadius: 'var(--radius-md)',
      borderLeft: `5px solid ${t.bar}`,
      padding: '16px 18px',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.bar,
      display: 'inline-flex',
      flex: 'none',
      marginTop: 2
    }
  }, icon), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--weight-bold)',
      color: t.text,
      marginBottom: children ? 4 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** A labeled text field with large, accessible sizing for older readers. */
function Input({
  label,
  hint,
  error,
  type = 'text',
  id,
  iconLeft = null,
  value,
  onChange,
  placeholder,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fid = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--focus-ring)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      height: 'var(--control-h-md)',
      padding: '0 16px',
      background: disabled ? 'var(--surface-sunken)' : 'var(--white)',
      border: `2px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? '0 0 0 4px var(--blue-50)' : 'none',
      transition: 'border-color var(--duration-base), box-shadow var(--duration-base)'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'inline-flex'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-strong)'
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** An accessible on/off toggle with a large hit area. */
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const fid = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    id: fid,
    role: "switch",
    "aria-checked": checked,
    type: "button",
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 56,
      height: 32,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: checked ? 'var(--green-500)' : 'var(--gray-300)',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--duration-base) var(--ease-standard)'
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      left: checked ? 28 : 4,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--duration-base) var(--ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-strong)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Shared inline icon set for Compass AgeWell UI kits.
// Lucide-style stroke icons (2.2 weight, round caps) — matches the friendly healthcare tone.
function Icon({
  d,
  size = 24,
  fill = 'none',
  stroke = 'currentColor',
  sw = 2.2,
  children
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: stroke,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, d ? /*#__PURE__*/React.createElement("path", {
    d: d
  }) : children);
}
const IconPhone = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
}));
const IconCalendar = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "4",
  width: "18",
  height: "18",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 2v4M8 2v4M3 10h18"
}));
const IconPill = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "m10.5 20.5-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m8.5 8.5 7 7"
}));
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
}), /*#__PURE__*/React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const IconUsers = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "7",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
}));
const IconMessage = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
}));
const IconGlobe = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M20 6 9 17l-5-5"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14M12 5l7 7-7 7"
}));
const IconMenu = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12h18M3 6h18M3 18h18"
}));
const IconClock = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 6v6l4 2"
}));
Object.assign(window, {
  Icon,
  IconPhone,
  IconCalendar,
  IconPill,
  IconHeart,
  IconShield,
  IconUsers,
  IconMessage,
  IconGlobe,
  IconCheck,
  IconArrow,
  IconMenu,
  IconClock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/app.jsx
try { (() => {
// Compass AgeWell — Member Portal app (login → dashboard).
const {
  Button: PBtn,
  Badge: PBadge,
  Card: PCard,
  Avatar: PAvatar,
  Input: PInput,
  Switch: PSwitch,
  Alert: PAlert
} = window.CompassAgeWellDesignSystem_ce0e6d;
function Login({
  onEnter
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--green-700)',
      color: '#fff',
      padding: '56px 48px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-horizontal-white.png",
    alt: "Compass AgeWell",
    style: {
      height: 42,
      alignSelf: 'flex-start'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      color: '#fff',
      fontSize: 40,
      lineHeight: 1.1
    }
  }, "Ch\xE0o m\u1EEBng tr\u1EDF l\u1EA1i."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--green-100)',
      fontSize: 'var(--text-lg)',
      maxWidth: 360
    }
  }, "C\u1ED5ng th\xF4ng tin ch\u0103m s\xF3c c\u1EE7a b\u1EA1n \u2014 thu\u1ED1c men, l\u1ECBch h\u1EB9n, v\xE0 \u0111\u1ED9i ng\u0169 ch\u0103m s\xF3c, t\u1EA5t c\u1EA3 \u1EDF m\u1ED9t n\u01A1i.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      color: 'var(--green-100)'
    }
  }, /*#__PURE__*/React.createElement(IconPhone, {
    size: 20
  }), " ", /*#__PURE__*/React.createElement("span", null, "C\u1EA7n gi\xFAp \u0111\u1EE1? G\u1ECDi (800) 555-0148"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      marginBottom: 6
    }
  }, "\u0110\u0103ng nh\u1EADp"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginBottom: 28
    }
  }, "Sign in to your member account"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(PInput, {
    label: "S\u1ED1 th\xE0nh vi\xEAn \xB7 Member ID",
    defaultValue: "MED-44210",
    iconLeft: /*#__PURE__*/React.createElement(IconShield, {
      size: 20
    })
  }), /*#__PURE__*/React.createElement(PInput, {
    label: "M\u1EADt kh\u1EA9u \xB7 Password",
    type: "password",
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement(PBtn, {
    fullWidth: true,
    size: "lg",
    onClick: onEnter
  }, "\u0110\u0103ng nh\u1EADp"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onEnter();
    },
    style: {
      textAlign: 'center',
      color: 'var(--text-link)',
      fontWeight: 500
    }
  }, "Qu\xEAn m\u1EADt kh\u1EA9u?")))));
}
function Sidebar({
  active,
  onSelect
}) {
  const items = [['home', 'Trang chủ', IconHeart], ['meds', 'Thuốc của tôi', IconPill], ['visits', 'Lịch hẹn', IconCalendar], ['team', 'Đội ngũ chăm sóc', IconUsers], ['messages', 'Tin nhắn', IconMessage]];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 248,
      flex: 'none',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--border-subtle)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-horizontal-primary.png",
    alt: "Compass AgeWell",
    style: {
      height: 34,
      margin: '4px 8px 28px'
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, items.map(([id, label, Ic]) => {
    const on = id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onSelect(id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 17,
        fontWeight: on ? 700 : 500,
        background: on ? 'var(--green-50)' : 'transparent',
        color: on ? 'var(--green-700)' : 'var(--text-body)'
      }
    }, /*#__PURE__*/React.createElement(Ic, {
      size: 22,
      stroke: on ? 'var(--green-600)' : 'var(--text-muted)'
    }), " ", label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 8px',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(PAvatar, {
    name: "Nguy\u1EC5n V\u0103n A",
    tone: "green",
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Nguy\u1EC5n V\u0103n A"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "ID \xB7 MED-44210"))));
}
function StatTile({
  icon: Ic,
  label,
  value,
  tone
}) {
  return /*#__PURE__*/React.createElement(PCard, {
    style: {
      padding: 20,
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      flex: 'none',
      background: `var(--${tone}-50)`,
      color: `var(--${tone}-600, var(--${tone}-700))`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 26
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: 'var(--text-strong)',
      lineHeight: 1.1
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 15
    }
  }, label)));
}
function Dashboard() {
  const meds = [['Amlodipine 5mg', 'Huyết áp · 1 viên mỗi sáng', 'success', 'Đủ thuốc'], ['Metformin 500mg', 'Tiểu đường · 2 viên mỗi ngày', 'warning', 'Còn 5 ngày'], ['Atorvastatin 20mg', 'Cholesterol · 1 viên buổi tối', 'success', 'Đủ thuốc']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 40px',
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Th\u1EE9 T\u01B0, 18 th\xE1ng 6"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 36,
      margin: '8px 0 0'
    }
  }, "Ch\xE0o bu\u1ED5i s\xE1ng, Anh A \uD83D\uDC4B")), /*#__PURE__*/React.createElement(PBtn, {
    iconLeft: /*#__PURE__*/React.createElement(IconPhone, {
      size: 20
    })
  }, "G\u1ECDi \u0111\u1ED9i ng\u0169 ch\u0103m s\xF3c")), /*#__PURE__*/React.createElement(PAlert, {
    tone: "warning",
    title: "S\u1EAFp \u0111\u1EBFn l\u1ECBch t\xE1i c\u1EA5p thu\u1ED1c",
    icon: /*#__PURE__*/React.createElement(IconPill, {
      size: 22
    }),
    style: {
      marginBottom: 24
    }
  }, "Metformin 500mg c\xF2n 5 ng\xE0y. Nh\u1EA5n \u0111\u1EC3 y\xEAu c\u1EA7u t\xE1i c\u1EA5p toa \u2014 \u0111\u1ED9i ng\u0169 s\u1EBD lo ph\u1EA7n c\xF2n l\u1EA1i."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20,
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    icon: IconCalendar,
    label: "L\u1ECBch h\u1EB9n k\u1EBF ti\u1EBFp",
    value: "24/6",
    tone: "blue"
  }), /*#__PURE__*/React.createElement(StatTile, {
    icon: IconPill,
    label: "Thu\u1ED1c \u0111ang d\xF9ng",
    value: "3",
    tone: "green"
  }), /*#__PURE__*/React.createElement(StatTile, {
    icon: IconClock,
    label: "Review thu\u1ED1c g\u1EA7n nh\u1EA5t",
    value: "2/6",
    tone: "orange"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(PCard, {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 22
    }
  }, "Thu\u1ED1c c\u1EE7a t\xF4i"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontWeight: 700,
      color: 'var(--text-link)'
    }
  }, "Xem t\u1EA5t c\u1EA3")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, meds.map(([name, sub, tone, status], i) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      flex: 'none',
      background: 'var(--green-50)',
      color: 'var(--green-600)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconPill, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--text-strong)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 14
    }
  }, sub)), /*#__PURE__*/React.createElement(PBadge, {
    tone: tone
  }, status))))), /*#__PURE__*/React.createElement(PCard, {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 22
    }
  }, "\u0110\u1ED9i ng\u0169 c\u1EE7a b\u1EA1n"), [['Cô Linh Phạm, RN', 'Điều phối viên chăm sóc', 'green'], ['BS. David Tran', 'Bác sĩ chính', 'blue']].map(([n, r, tone]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(PAvatar, {
    name: n,
    tone: tone,
    size: 48
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 14
    }
  }, r)))), /*#__PURE__*/React.createElement(PBtn, {
    variant: "outline",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(IconMessage, {
      size: 20
    }),
    style: {
      marginTop: 8
    }
  }, "Nh\u1EAFn tin cho \u0111\u1ED9i ng\u0169"))));
}
function PortalApp() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [tab, setTab] = React.useState('home');
  if (!loggedIn) return /*#__PURE__*/React.createElement(Login, {
    onEnter: () => setLoggedIn(true)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      minHeight: 720
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: tab,
    onSelect: setTab
  }), /*#__PURE__*/React.createElement(Dashboard, null));
}
Object.assign(window, {
  PortalApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/sections.jsx
try { (() => {
// Compass AgeWell — marketing website sections.
const {
  Button: WBtn,
  Badge: WBadge,
  Card: WCard
} = window.CompassAgeWellDesignSystem_ce0e6d;
function SiteHeader({
  onNav
}) {
  const links = [['Cách hoạt động', 'how'], ['Dịch vụ', 'services'], ['Về chúng tôi', 'about']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(249,248,246,0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-horizontal-primary.png",
    alt: "Compass AgeWell",
    style: {
      height: 40
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 28,
      marginLeft: 'auto'
    }
  }, links.map(([t, id]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav && onNav(id);
    },
    style: {
      color: 'var(--text-body)',
      fontWeight: 500,
      fontSize: 16
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      color: 'var(--green-700)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(IconGlobe, {
    size: 18
  }), " EN / VI"), /*#__PURE__*/React.createElement(WBtn, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(IconPhone, {
      size: 18
    })
  }, "(800) 555-0148"))));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '72px 32px 64px',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: 48,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Medicare \xB7 Ch\u0103m s\xF3c song ng\u1EEF"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--text-display)',
      margin: '14px 0 18px',
      color: 'var(--green-700)'
    }
  }, "S\u1ED1ng Kh\u1ECFe.", /*#__PURE__*/React.createElement("br", null), "S\u1ED1ng Vui.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--blue-500)',
      fontWeight: 400,
      fontStyle: 'italic'
    }
  }, "\u0110\u01B0\u1EE3c Ch\u0103m S\xF3c.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-lg)',
      maxWidth: 480,
      marginBottom: 28
    }
  }, "H\u1EC7 th\u1ED1ng ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe qu\u1ED1c gia d\xE0nh ri\xEAng cho ng\u01B0\u1EDDi M\u1EF9 g\u1ED1c Vi\u1EC7t cao tu\u1ED5i \u2014 n\xF3i ti\u1EBFng Vi\u1EC7t, hi\u1EC3u gia \u0111\xECnh b\u1EA1n."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(WBtn, {
    size: "lg"
  }, "\u0110\u0103ng k\xFD mi\u1EC5n ph\xED"), /*#__PURE__*/React.createElement(WBtn, {
    size: "lg",
    variant: "outline",
    iconLeft: /*#__PURE__*/React.createElement(IconPhone, {
      size: 20
    })
  }, "G\u1ECDi cho ch\xFAng t\xF4i")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginTop: 32,
      color: 'var(--text-muted)',
      fontSize: 15,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 18,
    stroke: "var(--green-500)"
  }), " Kh\xF4ng t\u1ED1n ph\xED v\u1EDBi Medicare"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 18,
    stroke: "var(--green-500)"
  }), " Ph\u1EE5c v\u1EE5 to\xE0n n\u01B0\u1EDBc M\u1EF9"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '-40px -60px auto auto',
      width: 360,
      height: 360,
      background: 'var(--green-100)',
      borderRadius: '50%',
      filter: 'blur(8px)',
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement(WCard, {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: 28,
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-icon-fullcolor.png",
    alt: "",
    style: {
      width: 56,
      height: 56
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 19,
      color: 'var(--text-strong)'
    }
  }, "\u0110i\u1EC3m ch\u1EA1m h\xE0ng th\xE1ng"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 15
    }
  }, "M\u1ED7i th\xE1ng, m\u1ED9t cu\u1ED9c g\u1ECDi"))), [[IconUsers, 'Đội ngũ chăm sóc nói tiếng Việt'], [IconPill, 'Review thuốc mỗi tháng'], [IconCalendar, 'Nhắc lịch khám & tái khám']].map(([Ic, t], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'var(--green-50)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--green-600)'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: 'var(--text-strong)',
      fontWeight: 500
    }
  }, t)))))));
}
function ValueProps() {
  const items = [[IconUsers, 'Cùng ngôn ngữ', 'Đội ngũ điều dưỡng và điều phối viên nói tiếng Việt, hiểu văn hóa gia đình.'], [IconPill, 'Quản lý thuốc', 'Review thuốc hàng tháng để tránh tương tác và nhắc tái cấp toa đúng hạn.'], [IconShield, 'An tâm với Medicare', 'Chúng tôi lo phần giấy tờ phức tạp. Bạn chỉ cần tập trung sống khỏe.']];
  return /*#__PURE__*/React.createElement("section", {
    id: "services",
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '64px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 640,
      margin: '0 auto 44px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "V\xEC sao ch\u1ECDn Compass AgeWell"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 12
    }
  }, "Ch\u0103m s\xF3c li\xEAn t\u1EE5c, nh\u01B0 ng\u01B0\u1EDDi th\xE2n trong nh\xE0")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    }
  }, items.map(([Ic, t, d], i) => /*#__PURE__*/React.createElement(WCard, {
    key: i,
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: 'var(--green-50)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--green-600)',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 28
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 21,
      marginBottom: 8
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)'
    }
  }, d))))));
}
function HowItWorks() {
  const steps = [['1', 'Gọi hoặc đăng ký', 'Một cuộc gọi bằng tiếng Việt để bắt đầu — hoàn toàn miễn phí.'], ['2', 'Gặp đội ngũ của bạn', 'Bạn được ghép với một điều phối viên chăm sóc riêng.'], ['3', 'Được chăm sóc mỗi tháng', 'Review thuốc, nhắc lịch, và luôn có người để gọi.']];
  return /*#__PURE__*/React.createElement("section", {
    id: "how",
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '72px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 600,
      margin: '0 auto 48px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "C\xE1ch ho\u1EA1t \u0111\u1ED9ng"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 12
    }
  }, "B\u1EAFt \u0111\u1EA7u trong ba b\u01B0\u1EDBc \u0111\u01A1n gi\u1EA3n")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 32
    }
  }, steps.map(([n, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--green-500)',
      color: '#fff',
      fontSize: 28,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      boxShadow: 'var(--shadow-brand)'
    }
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 21,
      marginBottom: 8
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)',
      maxWidth: 280,
      marginInline: 'auto'
    }
  }, d)))));
}
function CtaBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--green-700)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '56px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#fff',
      marginBottom: 8
    }
  }, "S\u1EB5n s\xE0ng \u0111\u1EC3 \u0111\u01B0\u1EE3c ch\u0103m s\xF3c?"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--green-100)',
      fontSize: 'var(--text-lg)'
    }
  }, "G\u1ECDi mi\u1EC5n ph\xED \u2014 ch\xFAng t\xF4i n\xF3i ti\u1EBFng Vi\u1EC7t.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(WBtn, {
    size: "lg",
    style: {
      background: '#fff',
      color: 'var(--green-700)',
      border: '2px solid #fff',
      boxShadow: 'none'
    }
  }, "\u0110\u0103ng k\xFD ngay"), /*#__PURE__*/React.createElement(WBtn, {
    size: "lg",
    variant: "ghost",
    style: {
      color: '#fff'
    },
    iconLeft: /*#__PURE__*/React.createElement(IconPhone, {
      size: 20
    })
  }, "(800) 555-0148"))));
}
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-900)',
      color: 'var(--gray-300)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '48px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 32,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-horizontal-white.png",
    alt: "Compass AgeWell",
    style: {
      height: 36
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      maxWidth: 420
    }
  }, "Compass AgeWell l\xE0 h\u1EC7 th\u1ED1ng qu\u1EA3n l\xFD ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe cho c\u1ED9ng \u0111\u1ED3ng ng\u01B0\u1EDDi Vi\u1EC7t s\u1EED d\u1EE5ng Medicare t\u1EA1i Hoa K\u1EF3.")));
}
Object.assign(window, {
  SiteHeader,
  Hero,
  ValueProps,
  HowItWorks,
  CtaBand,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

})();
