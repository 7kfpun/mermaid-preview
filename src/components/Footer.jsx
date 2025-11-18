import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer>
      <p>{t("privacyPolicy")}</p>
      <a
        href="https://forms.gle/JNDcyANZEqoBxpm37"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("bugReport")}
      </a>
    </footer>
  );
};

export default Footer;
