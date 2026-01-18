import type { CookieCategory } from "./types";

export const CONSENT_STORAGE_KEY = "sws_cookie_consent";
export const CONSENT_COOKIE_NAME = "sws_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EXPIRY_DAYS = 365;

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description:
      "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in or filling in forms.",
    required: true,
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description:
      "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.",
    required: false,
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description:
      "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.",
    required: false,
  },
];

export const COMPANY_NAME = "Solve With Software Ltd";
export const BANNER_TEXT =
  "We use cookies that help us provide you with the best possible experience with us. For example, they allow us to connect to social networks, display personalised content, as well as analyse and improve the operation of our website.";
