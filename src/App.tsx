import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import { PlatformProvider } from "./contexts/PlatformContext";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { PanicButton } from "./components/PanicButton";
import { GlobalHelpChat } from "./components/GlobalHelpChat";
import { GlobalLiveActivity } from "./components/GlobalLiveActivity";

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <PlatformProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AnimatedRoutes />
            <GlobalLiveActivity />
            <GlobalHelpChat />
            <PanicButton />
          </BrowserRouter>
        </PlatformProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
