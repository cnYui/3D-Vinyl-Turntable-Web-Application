import React from 'react';
import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-950 to-stone-950 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-6xl text-amber-200 tracking-wide">
            VINTAGE TURNTABLE
          </h1>
          <p className="text-amber-300/70 text-xl">
            Loading your vinyl experience...
          </p>
        </motion.div>

        {/* Animated vinyl record */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-stone-800 to-stone-900 border-4 border-amber-600"
        >
          <div className="w-full h-full rounded-full border-8 border-stone-700 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-600"></div>
          </div>
        </motion.div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-3 h-3 rounded-full bg-amber-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}