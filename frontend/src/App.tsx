import '@/App.css'
import NavBar from '@/components/NavBar'
import Hero from '@/components/Hero'
import Experience from '@/components/Experience'
import About from '@/components/About'
import Footer from '@/components/Footer'



function App() {
  return (
    <div className="max-w-480 mx-auto min-h-screen">
      <NavBar/>
      <Hero />
      <Experience />
      <About />
      <Footer />
    </div>
  )
}

export default App
