import HeroSection from "./HeroSection";
import Features from "./Features";
import LiveAlerts from "./LiveAlerts";
import About from "./About";


function Home() {
    return (
        <div>
            <HeroSection></HeroSection>
            <Features></Features>
            <LiveAlerts></LiveAlerts>
            <About></About>
        </div>
    )
}

export default Home;