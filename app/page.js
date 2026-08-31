<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VSI Information Management System</title>
  <script src="https://tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'yale-blue': '#094074',
            'baltic-blue': '#3c6997',
            'regal-navy': '#003566',
            'school-bus-yellow': '#ffc300',
            'gold': '#ffd60a',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #003566; /* --regal-navy */
    }
    /* Loading Spinner Animation */
    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-left-color: currentColor;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans select-none antialiased border-t-[14px] border-school-bus-yellow">

  <!-- Main Hero Content Container -->
  <main class="flex-grow flex flex-col items-center justify-center px-4 text-center">
    <div class="max-w-3xl mx-auto">
      
      <!-- Primary Brand Header -->
      <h1 class="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-3">
        <span class="text-school-bus-yellow block sm:inline">VSI Information</span> 
        <span class="text-white block mt-1 sm:mt-0">Management System</span>
      </h1>
      
      <!-- Supporting Description Subtitle -->
      <p class="text-slate-300 text-base sm:text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto mb-10">
        Data, evidence and insight behind our work
      </p>

      <!-- Action Navigation Buttons with Event Interceptors -->
      <div class="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-3">
        <button onclick="handleNavigation(this, 'https://vsizambia.org')" 
                class="w-full sm:w-auto text-white border border-white/80 hover:bg-white/10 font-normal px-5 py-2.5 rounded-full text-xs transition duration-200 tracking-wide text-center flex items-center justify-center gap-2">
          <span>Submit an activity report</span>
        </button>
        <button onclick="handleNavigation(this, 'https://vsizambia.org')" 
                class="w-full sm:w-auto bg-school-bus-yellow hover:bg-gold text-regal-navy font-semibold px-5 py-2.5 rounded-full text-xs transition duration-200 tracking-wide text-center flex items-center justify-center gap-2 shadow-md">
          <span>Volunteer Activity Logbook</span>
        </button>
      </div>

    </div>
  </main>

  
  <footer class="w-full pb-12 flex justify-center items-center">
    <div class="flex items-center gap-3 text-left">
      <!-- High-fidelity SVG recreation of the VSI Crest Logo -->
      <svg class="w-9 h-9 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://w3.org">
        <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
        <path d="M50 8L86 30V65L50 92L14 65V30L50 8Z" stroke="currentColor" stroke-width="2"/>
        <path d="M30 35L42 70H50L58 70L70 35H60L52 60H48L40 35H30Z" fill="currentColor"/>
        <path d="M35 25H65" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <div class="leading-none tracking-wider text-[10px] uppercase font-bold text-white">
        Visionary<br/>
        Students<br/>
        Initiative
      </div>
    </div>
  </footer>

  <script>
    /**
     * Intercepts button triggers to inject dynamic visual processing micro-states 
     * before delegating execution to top-level browser routing threads.
     */
    function handleNavigation(element, targetUrl) {
      // Prevent rapid concurrent event handling
      if (element.getAttribute('data-loading') === 'true') return;
      element.setAttribute('data-loading', 'true');
      
      const textLabel = element.querySelector('span');
      const originalText = textLabel.textContent;
      
      // Inject loading components dynamically into the DOM node matrix
      textLabel.textContent = 'Connecting...';
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      element.insertBefore(spinner, textLabel);
      
      // Enforce operational UX delay before initiating external redirect
      setTimeout(() => {
        window.location.href = targetUrl;
        
        // Graceful rollback environment in case the window thread is preserved on backward caching
        setTimeout(() => {
          element.removeAttribute('data-loading');
          textLabel.textContent = originalText;
          spinner.remove();
        }, 1000);
      }, 450);
    }
  </script>

</body>
</html>
