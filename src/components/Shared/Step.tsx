interface StepProps {
  title: string;
  children: React.ReactNode;
}

export const Step = ({ title, children }: StepProps) => {
  return (
    <div className="step">
      <h2 className="step-title">{title}</h2>
      <div className="step-content">{children}</div>
    </div>
  );
};
