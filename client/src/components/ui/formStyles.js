export const labelCls = "block font-label-md text-label-md text-on-surface mb-1";

export const inputCls = (hasError) =>
  `w-full px-space-md py-2.5 bg-surface-container-lowest border font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none ${
    hasError ? "border-error" : "border-outline"
  }`;

export const primaryBtn =
  "px-space-lg py-2.5 bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed";

export const ghostBtn =
  "px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high disabled:opacity-60";