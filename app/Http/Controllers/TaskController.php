<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    public function index()
    {
        try {
            $tasks = auth()->user()->tasks;

            foreach ($tasks as $task) {
                if ($task->attachment_url) {
                    $task->attachment_url = url('api/tasks/' . $task->id . '/preview');
                }
            }

            return response()->json([
                'message' => 'Tasks list',
                'data' => $tasks,
            ]);
        } catch (\Exception $e) {
            Log::error('Task.index', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreTaskRequest $request)
    {
        try {
            /** @var App\Model\User */
            $user = auth()->user();
            $task = $user->tasks()->create([
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'status' => $request->validated('status'),
                'deadline' => $request->validated('deadline'),
            ]);

            if ($request->hasFile('attachment_url')) {
                $task->attachment_url = $request->file('attachment_url')->store('private', 'local');
                $task->save();
            }

            $task->attachment_url = url('api/tasks/' . $task->id . '/preview');

            return response()->json([
                'message' => 'Task created successfully',
                'data' => $task,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Task.store', ['error' => $e, 'request' => $request->validated()]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            if ($task->user_id != auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $task->attachment_url = url('api/tasks/' . $task->id . '/preview');

            return response()->json([
                'message' => 'Task details',
                'data' => $task,
            ]);
        } catch (\Exception $e) {
            Log::error('Task.show', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateTaskRequest $request, $id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            if ($task->user_id != auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $task->update([
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'status' => $request->validated('status'),
                'deadline' => $request->validated('deadline'),
            ]);

            if ($request->hasFile('attachment_url')) {
                if ($task->attachment_url) {
                    $oldFilePath = storage_path('app/private/' . $task->attachment_url);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                $task->attachment_url = $request->file('attachment_url')->store('private', 'local');
                $task->save();
            }

            $task->attachment_url = url('api/tasks/' . $task->id . '/preview');

            return response()->json([
                'message' => 'Task updated successfully',
                'data' => $task,
            ]);
        } catch (\Exception $e) {
            Log::error('Task.update', ['error' => $e, 'request' => $request->validated()]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            if ($task->user_id != auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($task->attachment_url) {
                $filePath = storage_path('app/private/' . $task->attachment_url);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            $task->delete();

            return response()->json(['message' => 'Task deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Task.destroy', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function attachment($taskId)
    {
        try {
            $task = Task::find($taskId);

            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            if ($task->user_id != auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $filePath = storage_path('app/private/' . $task->attachment_url);

            if (!file_exists($filePath)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->download($filePath);
        } catch (\Exception $e) {
            Log::error('Task.attachment', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
