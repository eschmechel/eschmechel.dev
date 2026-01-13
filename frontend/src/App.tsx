import '@/App.css'
import NavBar from '@/components/NavBar'
import Hero from '@/components/Hero'
import TechStack from '@/components/TechStack'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'




function App() {
  return (
    <div className="max-w-480 mx-auto min-h-screen">
      <NavBar/>
      <Hero />
      <TechStack />
      <Experience />
      <Footer />
    </div>
  )
}

export default App
