const StackableContainer = (props) => (
  <div className={`container ${props.base ? "base" : ""}`}>
    {props.children}

    <style jsx>{`
      .container {
        background: rgba(255, 255, 255, 0.09);
        padding: ${props.lessPadding ? "15px" : "30px"};
        margin-top: ${props.lessMargin || props.base ? "25px" : "50px"};
        border-radius: ${props.lessRadius ? "10px" : "20px"};

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        height: ${props.fullHeight ? "100%" : "auto"};
      }

      .container:first-child {
        margin-top: 0;
      }

      .base {
        max-width: 750px;
        background: rgb(240, 168, 72, 1);
        box-shadow: 0px 28px 80px rgba(0, 0, 0, 0.1),
          0px 12.7134px 39.2617px rgba(0, 0, 0, 0.0619173),
          0px 7.26461px 23.349px rgba(0, 0, 0, 0.0538747),
          0px 4.44678px 14.5028px rgba(0, 0, 0, 0.0477964),
          0px 2.71437px 8.88638px rgba(0, 0, 0, 0.0422036),
          0px 1.53495px 5.02137px rgba(0, 0, 0, 0.0361253),
          0px 0.671179px 2.19114px rgba(0, 0, 0, 0.0280827);
      }
    `}</style>
  </div>
);
export default StackableContainer;