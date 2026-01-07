import '@/App.css'
import NavBar from '@/components/NavBar'
import Hero from '@/components/Hero'
import Work from '@/components/Work'
import Projects from '@/components/Projects'
import About from '@/components/About'
import Footer from '@/components/Footer'



function App() {
  return (
    <div className="max-w-480 mx-auto min-h-screen">
      <NavBar/>
      <Hero />
      <Work />
      <Projects />
      <About />
      <Footer />
    </div>
  )
}

export default App
