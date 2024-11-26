document.addEventListener("DOMContentLoaded", function () {
    const installButton = document.getElementById("installButton");
    const iosInstallPrompt = document.getElementById("iosInstallPrompt");
    let deferredPrompt;
  
    const isIos = () => /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isInStandaloneMode = () =>
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
  
    if (isIos()) installButton.style.display = "none";
    if (isIos() && !isInStandaloneMode()) iosInstallPrompt.style.display = "block";
    if (isInStandaloneMode()) {
      installButton.style.display = "none";
      if (iosInstallPrompt) iosInstallPrompt.style.display = "none";
    }
  
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (!isIos() && !isInStandaloneMode()) {
        installButton.style.display = "block";
      }
    });
  
    installButton.addEventListener("click", () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("Пользователь принял установку приложения");
            saveDeviceInfo();
          } else {
            console.log("Пользователь отклонил установку приложения");
          }
          deferredPrompt = null;
        });
      }
    });
  
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/static/sw.js")
          .then((registration) =>
            console.log("Service Worker зарегистрирован с областью:", registration.scope)
          )
          .catch((err) => console.log("Ошибка регистрации Service Worker:", err));
      });
    }
  
    const deviceModel = navigator.userAgentData?.platform || navigator.platform || "Unknown";
    const deviceType = getDeviceType();
    const deviceOS = getOSName();
    const deviceOSVersion = getOSVersion();
    const { browserName, browserVersion } = getBrowserInfo();
    const browserLanguage = navigator.language || navigator.userLanguage;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const referrer = document.referrer || "Direct";
    const { language, country } = getLanguageAndCountry();
  
    const deviceInfo = {
      deviceModel,
      deviceType,
      deviceOS,
      deviceOSVersion,
      browserName,
      browserVersion,
      browserLanguage,
      timeZone,
      referrer,
      deviceLanguage: language,
      deviceCountry: country,
    };
  
    // Сохраняем данные локально на сервере через POST
    function saveDeviceInfo() {
      fetch("/save-device-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceInfo),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Данные успешно сохранены на сервере:", data);
        })
        .catch((error) => console.error("Ошибка при сохранении данных:", error));
    }
  
    // Функция отправки данных на сервер
//   function sendDeviceInfo() {
//     fetch('https://your-server-endpoint.com/api/track-install', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'AppsFlyer-ID': 'your-appsflyer-id',
//         'Bundle-ID': 'your-bundle-id'
//       },
//       body: deviceInfo
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Ответ от сервера:', data);
//         if (data.statusCode === 200 && data.redirectUrl) window.location.href = data.redirectUrl;
//       })
//       .catch(error => console.error('Ошибка при отправке данных:', error));
//   } 

    function getDeviceType() {
      const ua = navigator.userAgent;
      if (/Mobile|Android|iP(ad|hone)/.test(ua)) return "Mobile";
      if (/Tablet|iPad/.test(ua)) return "Tablet";
      return "Desktop";
    }
  
    function getOSName() {
      const platform = navigator.userAgentData?.platform || navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      if (platform.includes("win")) return "Windows";
      if (platform.includes("mac")) return "MacOS";
      if (platform.includes("linux")) return "Linux";
      if (/android/.test(userAgent)) return "Android";
      if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";
      return "Unknown";
    }
  
    function getOSVersion() {
      const userAgent = navigator.userAgent;
      if (/Windows NT (\d+\.\d+)/.test(userAgent)) return RegExp.$1;
      if (/Mac OS X (\d+[\._]\d+)/.test(userAgent)) return RegExp.$1.replace("_", ".");
      if (/Android (\d+\.\d+)/.test(userAgent)) return RegExp.$1;
      if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(userAgent)) return RegExp.$1.replace("_", ".");
      return "Unknown";
    }
  
    function getBrowserInfo() {
      const ua = navigator.userAgent;
      if (/MSIE (\d+\.\d+);/.test(ua)) return { browserName: "Internet Explorer", browserVersion: RegExp.$1 };
      if (/Chrome\/(\d+\.\d+)/.test(ua)) return { browserName: "Chrome", browserVersion: RegExp.$1 };
      if (/Firefox\/(\d+\.\d+)/.test(ua)) return { browserName: "Firefox", browserVersion: RegExp.$1 };
      if (/Safari\/(\d+\.\d+)/.test(ua) && !/Chrome/.test(ua)) return { browserName: "Safari", browserVersion: RegExp.$1 };
      if (/Opera\/(\d+\.\d+)/.test(ua)) return { browserName: "Opera", browserVersion: RegExp.$1 };
      return { browserName: "Unknown", browserVersion: "Unknown" };
    }
  
    function getLanguageAndCountry() {
      const locale = navigator.language || navigator.userLanguage;
      const parts = locale.split("-");
      return { language: parts[0], country: parts[1] || "Unknown" };
    }
  });

  // Управление каруселью скриншотов
  const carouselTrack = document.querySelector(".carousel-track");
  const slides = Array.from(carouselTrack.children);
  const nextButton = document.querySelector(".next-button");
  const prevButton = document.querySelector(".prev-button");
  let slideWidth = slides[0].getBoundingClientRect().width;

  // Установка позиции слайдов
  slides.forEach((slide, index) => (slide.style.left = slideWidth * index + "px"));

  // Переход к следующему слайду
  nextButton.addEventListener("click", () => {
    const currentSlide = carouselTrack.querySelector(".current-slide");
    const nextSlide = currentSlide.nextElementSibling || slides[0];
    moveToSlide(carouselTrack, currentSlide, nextSlide);
  });

  // Переход к предыдущему слайду
  prevButton.addEventListener("click", () => {
    const currentSlide = carouselTrack.querySelector(".current-slide");
    const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1];
    moveToSlide(carouselTrack, currentSlide, prevSlide);
  });

  // Функция перемещения слайда
  function moveToSlide(track, currentSlide, targetSlide) {
    track.style.transform = "translateX(-" + targetSlide.style.left + ")";
    currentSlide.classList.remove("current-slide");
    targetSlide.classList.add("current-slide");
  }

  // Установка текущего слайда
  slides[0].classList.add("current-slide");