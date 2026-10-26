library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/task_repository.dart';
import '../domain/task.dart';

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  return TaskRepository(ref.read(apiClientProvider));
});

class TaskListState {
  const TaskListState({
    this.loading = false,
    this.tasks = const [],
    this.errorMessage,
  });

  final bool loading;
  final List<Task> tasks;
  final String? errorMessage;

  TaskListState copyWith({
    bool? loading,
    List<Task>? tasks,
    String? errorMessage,
  }) {
    return TaskListState(
      loading: loading ?? this.loading,
      tasks: tasks ?? this.tasks,
      errorMessage: errorMessage,
    );
  }
}

final taskListProvider =
    NotifierProvider<TaskListNotifier, TaskListState>(TaskListNotifier.new);

class TaskListNotifier extends Notifier<TaskListState> {
  @override
  TaskListState build() {
    Future.microtask(() => loadTasks());
    return const TaskListState(loading: true);
  }

  Future<void> loadTasks() async {
    state = state.copyWith(loading: true, errorMessage: null);
    try {
      final tasks = await ref.read(taskRepositoryProvider).list();
      state = TaskListState(loading: false, tasks: tasks);
    } catch (e) {
      state = TaskListState(
        loading: false,
        tasks: state.tasks,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> createTask(String title, String? description) async {
    try {
      final newTask =
          await ref.read(taskRepositoryProvider).create(title, description);
      state = state.copyWith(tasks: [newTask, ...state.tasks]);
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
      rethrow;
    }
  }

  Future<void> toggleTask(Task task) async {
    final updatedCompleted = !task.completed;
    try {
      final updated = await ref
          .read(taskRepositoryProvider)
          .setCompleted(task, updatedCompleted);
      state = state.copyWith(
        tasks: state.tasks
            .map((t) => t.id == task.id ? updated : t)
            .toList(),
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
      rethrow;
    }
  }

  Future<void> deleteTask(String taskId) async {
    try {
      await ref.read(taskRepositoryProvider).delete(taskId);
      state = state.copyWith(
        tasks: state.tasks.where((t) => t.id != taskId).toList(),
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
      rethrow;
    }
  }
}
