import React from "react";

export default function TestThemeHomePage() {
  return (
    <div className="p-8" data-testid="testtheme-home">
      <h1 className="text-3xl font-bold">Welcome to TestTheme Home</h1>
      <p>This is rendered specifically by the testtheme fixture.</p>
    </div>
  );
}
