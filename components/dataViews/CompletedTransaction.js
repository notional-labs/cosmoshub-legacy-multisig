import StackableContainer from "../layout/StackableContainer";
import Button from "../inputs/Button";

export default ({ transactionHash }) => (
  <StackableContainer lessPadding lessMargin>
    <StackableContainer lessPadding lessMargin lessRadius>
      <div className="confirmation">
        <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
        </svg>
        <p>This transaction has been broadcast.</p>
      </div>
    </StackableContainer>
    <Button
      href={`${process.env.NEXT_PUBLIC_CHAIN_EXPLORER}${transactionHash}`}
      label="View transaction"
      target='#'
    ></Button>
    <style jsx>{`
      .confirmation {
        display: flex;
        justify-content: center;
      }
      .confirmation svg {
        height: 0.8em;
        margin-right: 0.5em;
      }
    `}</style>
  </StackableContainer>
);
