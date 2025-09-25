"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FileChangeItem {
  id: string
  filename: string
  path: string
  status: 'pending' | 'completed'
  type: 'modified' | 'added' | 'deleted'
}

interface FileChangeChecklistProps {
  files?: FileChangeItem[]
  autoPlay?: boolean
  interval?: number
}

const FileChangeChecklist: React.FC<FileChangeChecklistProps> = ({
  files = [
    {
      id: '1',
      filename: 'page.tsx',
      path: 'src/app/page.tsx',
      status: 'pending',
      type: 'modified'
    },
    {
      id: '2',
      filename: 'layout.tsx',
      path: 'src/app/layout.tsx',
      status: 'pending',
      type: 'modified'
    },
    {
      id: '3',
      filename: 'globals.css',
      path: 'src/app/globals.css',
      status: 'pending',
      type: 'modified'
    },
    {
      id: '4',
      filename: 'components.json',
      path: 'components.json',
      status: 'pending',
      type: 'added'
    }
  ],
  autoPlay = true,
  interval = 1500
}) => {
  const [fileStates, setFileStates] = useState<FileChangeItem[]>(() => files.map(f => ({ ...f, status: 'pending' as const })))
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!autoPlay || !files?.length) return

    // Reset states
    setFileStates(() => files.map(f => ({ ...f, status: 'pending' as const })))
    currentIndexRef.current = 0
    setCurrentIndex(0)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current >= files.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        return
      }

      const idx = currentIndexRef.current
      setFileStates(prev => {
        const newStates = [...prev]
        newStates[idx] = { ...newStates[idx], status: 'completed' as const }
        return newStates
      })

      currentIndexRef.current += 1
      setCurrentIndex(currentIndexRef.current)
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, files, interval])

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'modified':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'added':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'deleted':
        return 'bg-red-500/10 text-red-600 border-red-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'modified':
        return 'M'
      case 'added':
        return 'A'
      case 'deleted':
        return 'D'
      default:
        return 'M'
    }
  }

  return (
    <div className="w-full space-y-2">
      {/* sequential, minimal rows — no big container/header */}
      <div className="space-y-2">
        <AnimatePresence>
          {fileStates.slice(0, Math.min(currentIndex + 1, fileStates.length)).map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -1, transition: { duration: 0.2 } }}
            >
              <Card className={`p-2 border rounded-md transition-all duration-300 ${
                file.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-background border-border hover:border-border/70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        file.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-muted-foreground/30'
                      }`}
                      animate={file.status === 'completed' ? {
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.3 }
                      } : {}}
                    >
                      {file.status === 'completed' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground leading-tight">
                          {file.filename}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {file.path}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0.5 font-mono ${getStatusColor(file.type)}`}
                  >
                    {getTypeLabel(file.type)}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FileChangeChecklist