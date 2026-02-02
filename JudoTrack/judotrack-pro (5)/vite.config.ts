import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (come API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // Inietta la API KEY nel codice in modo sicuro durante la build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Evita errori "process is not defined" nel browser
      'process.env': {}
    }
  };
});