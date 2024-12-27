'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { TodoControllerApi as TodoApi } from '@/api'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/api'

const api = new TodoApi()

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const response = await api.getAllTodos()
      setTodos(response.data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  const createTodo = async () => {
    if (!newTitle.trim()) return

    try {
      const newTodo: CreateTodoRequest = {
        title: newTitle,
        description: newDescription,
        completed: false
      }
      await api.createTodo(newTodo)
      setNewTitle('')
      setNewDescription('')
      loadTodos()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const updateTodo = async (id: string, updates: UpdateTodoRequest) => {
    try {
      await api.updateTodo( id, updates)
      loadTodos()
      setEditingTodo(null)
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await api.deleteTodo(id)
      loadTodos()
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const toggleComplete = async (todo: Todo) => {
    if (!todo.id) return

    const updates: UpdateTodoRequest = {
      title: todo.title || '',
      description: todo.description || '',
      completed: !todo.completed,
      tags: todo.tags || []
    }
    await updateTodo(todo.id, updates)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新規ToDo作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="タイトル"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="説明（任意）"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Button onClick={createTodo}>作成</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {todos.map((todo) => (
          <Card key={todo.id} className="relative">
            <CardContent className="pt-6">
              {editingTodo?.id === todo.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingTodo?.title || ''}
                    onChange={(e) =>
                      setEditingTodo({ ...editingTodo, title: e.target.value })
                    }
                  />
                  <Textarea
                    value={editingTodo?.description || ''}
                    onChange={(e) =>
                      setEditingTodo({
                        ...editingTodo,
                        description: e.target.value
                      })
                    }
                  />
                  <div className="space-x-2">
                    <Button
                      onClick={() => {
                        if (!todo.id || !editingTodo) return
                        updateTodo(todo.id, {
                          title: editingTodo.title || '',
                          description: editingTodo.description || '',
                          completed: editingTodo.completed || false,
                          tags: editingTodo.tags || []
                        })
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingTodo(null)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed || false}
                      onCheckedChange={() => toggleComplete(todo)}
                    />
                    <h3
                      className={`text-lg font-semibold ${
                        todo.completed ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {todo.title}
                    </h3>
                  </div>
                  {todo.description && (
                    <p className="text-gray-600">{todo.description}</p>
                  )}
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTodo(todo)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => todo.id && deleteTodo(todo.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
