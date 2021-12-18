const Button = (props) => (
  <>
    {props.href ? (
      <a
        className={props.primary ? "primary button" : "button"}
        href={props.href}
        disabled={props.disabled}
      >
        {props.label}
      </a>
    ) : (
      <button
        className={props.primary ? "primary button" : "button"}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.label}
      </button>
    )}
    <style jsx>{`
      .button {
        display: block;
        border-radius: 10px;
        background: #ff9f40;
        border: none;
        padding: 12px 0;
        font-size: 1rem;
        color: #483018;
        font-style: italic;
        margin-top: 20px;
        text-decoration: none;
        text-align: center;
      }

      button:first-child {
        margin-top: 0;
      }
      button:disabled {
        opacity: 0.5;
        cursor: initial;
      }
    `}</style>
  </>
);

export default Button;
