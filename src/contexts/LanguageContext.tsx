
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'nd';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Common
    'common.dashboard': 'Dashboard',
    'common.profile': 'Profile',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.signup': 'Sign Up',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    
    // Landing Page
    'landing.title': 'Welcome to Abathwa Capital',
    'landing.subtitle': 'Your trusted investment platform connecting entrepreneurs with investors',
    'landing.cta.signup': 'Get Started',
    'landing.cta.login': 'Sign In',
    'landing.benefits.entrepreneurs': 'For Entrepreneurs',
    'landing.benefits.investors': 'For Investors',
    'landing.benefits.providers': 'For Service Providers',
    
    // Forms
    'form.email': 'Email Address',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.phoneNumber': 'Phone Number',
    'form.organization': 'Organization Name',
    'form.role': 'Role',
    
    // Roles
    'role.entrepreneur': 'Entrepreneur',
    'role.investor': 'Investor',
    'role.serviceProvider': 'Service Provider',
    'role.admin': 'Administrator',
    
    // Navigation
    'nav.opportunities': 'Opportunities',
    'nav.investments': 'My Investments',
    'nav.pools': 'Investment Pools',
    'nav.serviceProviders': 'Service Providers',
    'nav.reports': 'Reports',
    'nav.users': 'Users',
    'nav.escrow': 'Escrow',
    'nav.settings': 'Settings',
  },
  nd: {
    // Common
    'common.dashboard': 'Ideshibhodhi',
    'common.profile': 'Umhombiso',
    'common.logout': 'Phuma',
    'common.login': 'Ngena',
    'common.signup': 'Zibhalise',
    'common.save': 'Gcina',
    'common.cancel': 'Yekela',
    'common.edit': 'Hlela',
    'common.delete': 'Cima',
    'common.create': 'Dala',
    'common.submit': 'Thumela',
    'common.search': 'Funa',
    'common.filter': 'Hlunga',
    'common.loading': 'Kuyalayishwa...',
    
    // Landing Page
    'landing.title': 'Siyakuamukela ku-Abathwa Capital',
    'landing.subtitle': 'Inkundla yethu yokutshala imali ehlanganisa oosomabhizinisi labatshali-mali',
    'landing.cta.signup': 'Qalisa',
    'landing.cta.login': 'Ngena',
    'landing.benefits.entrepreneurs': 'Koosomabhizinisi',
    'landing.benefits.investors': 'Kubatshali-mali',
    'landing.benefits.providers': 'Kubanikazi Benkonzo',
    
    // Forms
    'form.email': 'Ikheli le-imeyili',
    'form.password': 'Iphasiwedi',
    'form.confirmPassword': 'Qinisekisa Iphasiwedi',
    'form.firstName': 'Ibizo Lokuqala',
    'form.lastName': 'Isibongo',
    'form.phoneNumber': 'Inombolo Yocingo',
    'form.organization': 'Ibizo Lenhlangano',
    'form.role': 'Indima',
    
    // Roles
    'role.entrepreneur': 'Usomabhizinisi',
    'role.investor': 'Umtshali-mali',
    'role.serviceProvider': 'Umnikazi Wenkonzo',
    'role.admin': 'Umlawuli',
    
    // Navigation
    'nav.opportunities': 'Amathuba',
    'nav.investments': 'Ukutshala Kwami',
    'nav.pools': 'Amaqembu Okutshala',
    'nav.serviceProviders': 'Abanikazi Benkonzo',
    'nav.reports': 'Imibiko',
    'nav.users': 'Abasebenzisi',
    'nav.escrow': 'I-Escrow',
    'nav.settings': 'Izilungiselelo',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
