declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "survey-core/survey-core.min.css" {
  const content: string;
  export default content;
}
