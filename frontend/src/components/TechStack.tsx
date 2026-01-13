import { H2, H3 } from '@/components/Typographies'

interface TechCategory {
  name: string
  technologies: { name: string; url: string }[]
}

const techCategories: TechCategory[] = [
  {
    name: 'Frontend',
    technologies: [
      { name: 'React', url: 'https://react.dev' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
      { name: 'Next.js', url: 'https://nextjs.org' },
      { name: 'Vite', url: 'https://vitejs.dev' },
      { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }
    ]
  },
  {
    name: 'Backend',
    technologies: [
      { name: 'Node.js', url: 'https://nodejs.org' },
      { name: 'Cloudflare Workers', url: 'https://workers.cloudflare.com' },
      { name: 'Python', url: 'https://www.python.org' },
      { name: 'Express', url: 'https://expressjs.com' },
      { name: 'Redis', url: 'https://redis.io' },
      { name: 'MongoDB', url: 'https://www.mongodb.com' },
      { name: 'FastAPI', url: 'https://fastapi.tiangolo.com' }
    ]
  },
  {
    name: 'AI',
    technologies: [
      { name: 'Ollama', url: 'https://ollama.com' },
      { name: 'C++', url: 'https://isocpp.org' },
      { name: 'Python', url: 'https://www.python.org' },
      { name: 'PyTorch', url: 'https://pytorch.org' },
      { name: 'HuggingFace', url: 'https://huggingface.co' }
    ]
  },
  {
    name: 'DevOps & Cloud',
    technologies: [
      { name: 'Docker', url: 'https://www.docker.com' },
      { name: 'Kubernetes', url: 'https://kubernetes.io' },
      { name: 'Cloudflare', url: 'https://cloudflare.com' },
      { name: 'Git', url: 'https://git-scm.com' },
      { name: 'Linux', url: 'https://www.linux.org' },
      { name: 'Bash', url: 'https://www.gnu.org/software/bash' },
      { name: 'CMake', url: 'https://cmake.org' }
    ]
  }
]

const techLogos: Record<string, string> = {
  'React': '/tech-icons/react.svg',
  'TypeScript': '/tech-icons/typescript.svg',
  'Tailwind CSS': '/tech-icons/tailwindcss.svg',
  'Next.js': '/tech-icons/nextdotjs.svg',
  'Vite': '/tech-icons/vite.svg',
  'JavaScript': '/tech-icons/javascript.svg',
  'Node.js': '/tech-icons/nodedotjs.svg',
  'Cloudflare Workers': '/tech-icons/cloudflare.svg',
  'Python': '/tech-icons/python.svg',
  'Express': '/tech-icons/express.svg',
  'Docker': '/tech-icons/docker.svg',
  'Kubernetes': '/tech-icons/kubernetes.svg',
  'Cloudflare': '/tech-icons/cloudflare.svg',
  'Git': '/tech-icons/git.svg',
  'Bash': '/tech-icons/gnubash.svg',
  'Redis': '/tech-icons/redis.svg',
  'MongoDB': '/tech-icons/mongodb.svg',
  'FastAPI': '/tech-icons/fastapi.svg',
  'Ollama': '/tech-icons/ollama.svg',
  'C++': '/tech-icons/cplusplus.svg',
  'PyTorch': '/tech-icons/pytorch.svg',
  'HuggingFace': '/tech-icons/huggingface.svg',
  'Linux': '/tech-icons/linux.svg',
  'CMake': '/tech-icons/cmake.svg'
}

function TechTag({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-lg sm:text-base text-accent-100 hover:text-accent-300 transition-colors"
    >
      <img
        src={techLogos[children as string] || ''}
        alt=""
        className="w-7 h-7 sm:w-5 sm:h-5"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {children}
    </a>
  )
}

export default function TechStack() {
  return (
    <section id="techStack" className="max-w-7xl mx-auto px-4 py-8">
      <H2 className="text-3xl font-bold text-left mb-8">Technologies</H2>
      <div className="border-t border-accent-500 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {techCategories.map((category) => (
            <div key={category.name}>
              <H3 className="text-lg mb-4 text-accent-300 sm:text-left text-center">{category.name}</H3>
              <div className="flex flex-col gap-2 sm:items-start items-center">
                {category.technologies.map((tech) => (
                  <TechTag key={tech.name} url={tech.url}>{tech.name}</TechTag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
