
export const translations = {
  fr: {
    settings: {
      title: "Paramètres",
      theme: {
        title: "Thème de l'interface",
        description: "Choisissez l'apparence de l'application",
        light: "Clair",
        dark: "Sombre",
        system: "Système"
      },
      language: {
        title: "Langue de l'application",
        description: "Sélectionnez votre langue préférée"
      },
      currency: {
        title: "Devise par défaut",
        description: "Devise utilisée pour l'affichage des montants"
      },
      display: {
        title: "Préférences d'affichage",
        description: "Personnalisez l'affichage des données",
        dualAmounts: "Afficher les montants en double devise",
        marginPercentages: "Afficher les pourcentages de marge",
        roundNumbers: "Arrondir les chiffres",
        decimalPlaces: "Nombre de décimales"
      },
      profile: {
        title: "Informations personnelles",
        description: "Gérez vos informations de compte",
        email: "Email",
        logout: "Se déconnecter"
      },
      actions: {
        save: "Sauvegarder",
        reset: "Réinitialiser les préférences",
        resetConfirm: "Êtes-vous sûr de vouloir réinitialiser tous vos paramètres ?"
      }
    }
  },
  en: {
    settings: {
      title: "Settings",
      theme: {
        title: "Interface Theme",
        description: "Choose the application appearance",
        light: "Light",
        dark: "Dark",
        system: "System"
      },
      language: {
        title: "Application Language",
        description: "Select your preferred language"
      },
      currency: {
        title: "Default Currency",
        description: "Currency used for amount display"
      },
      display: {
        title: "Display Preferences",
        description: "Customize data display",
        dualAmounts: "Show dual currency amounts",
        marginPercentages: "Show margin percentages",
        roundNumbers: "Round numbers",
        decimalPlaces: "Decimal places"
      },
      profile: {
        title: "Personal Information",
        description: "Manage your account information",
        email: "Email",
        logout: "Logout"
      },
      actions: {
        save: "Save",
        reset: "Reset Preferences",
        resetConfirm: "Are you sure you want to reset all your settings?"
      }
    }
  },
  ar: {
    settings: {
      title: "الإعدادات",
      theme: {
        title: "مظهر الواجهة",
        description: "اختر مظهر التطبيق",
        light: "فاتح",
        dark: "داكن",
        system: "النظام"
      },
      language: {
        title: "لغة التطبيق",
        description: "اختر لغتك المفضلة"
      },
      currency: {
        title: "العملة الافتراضية",
        description: "العملة المستخدمة لعرض المبالغ"
      },
      display: {
        title: "تفضيلات العرض",
        description: "خصص عرض البيانات",
        dualAmounts: "عرض المبالغ بعملتين",
        marginPercentages: "عرض نسب الهامش",
        roundNumbers: "تقريب الأرقام",
        decimalPlaces: "الأرقام العشرية"
      },
      profile: {
        title: "المعلومات الشخصية",
        description: "إدارة معلومات حسابك",
        email: "البريد الإلكتروني",
        logout: "تسجيل الخروج"
      },
      actions: {
        save: "حفظ",
        reset: "إعادة تعيين التفضيلات",
        resetConfirm: "هل أنت متأكد من إعادة تعيين جميع إعداداتك؟"
      }
    }
  }
};

export function useTranslation(language: 'fr' | 'en' | 'ar' = 'fr') {
  return {
    t: translations[language],
    language
  };
}
