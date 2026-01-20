import { motion } from "framer-motion";

const benefits = [
  {
    stat: "10x",
    label: "Faster Development",
    description: "Skip weeks of boilerplate setup and start building features from day one.",
  },
  {
    stat: "100%",
    label: "Type-Safe",
    description: "End-to-end TypeScript with shared types between frontend and backend.",
  },
  {
    stat: "24/7",
    label: "Production Ready",
    description: "Battle-tested architecture with proper error handling and logging.",
  },
];

const techStack = [
  "React Router 7",
  "TypeScript",
  "Tailwind CSS",
  "Prisma",
  "PostgreSQL",
  "Redis",
  "Clerk",
  "PostHog",
  "Resend",
  "BullMQ",
  "OpenRouter",
  "Docker",
];

export function Benefits() {
  return (
    <section id="benefits" className="py-24 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white mb-2">{benefit.stat}</div>
              <div className="text-lg font-semibold text-gray-300 mb-2">{benefit.label}</div>
              <p className="text-gray-500">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Built with modern tools</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
