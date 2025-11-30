import * as React from 'react';

interface VerificationEmailProps {
  firstName: string;
}

export function VerificationEmail({ firstName }: VerificationEmailProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}

