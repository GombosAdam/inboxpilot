import { ArrowRight } from 'lucide-react';

interface Step {
  t: string; // title
  d: string; // description
}

interface StepDiagramProps {
  steps: Step[];
}

export function StepDiagram({ steps }: StepDiagramProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col md:flex-row items-center">
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-blue font-semibold">{index + 1}</span>
            </div>
            <h3 className="font-semibold text-ink mb-2">{step.t}</h3>
            <p className="text-slate text-sm">{step.d}</p>
          </div>
          
          {index < steps.length - 1 && (
            <ArrowRight className="h-5 w-5 text-slate mt-8 md:mt-0 md:ml-8 rotate-90 md:rotate-0" />
          )}
        </div>
      ))}
    </div>
  );
}