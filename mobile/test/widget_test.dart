import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/tasks/domain/task.dart';
import 'package:mobile/features/tasks/presentation/task_list_view.dart';

void main() {
  testWidgets('TaskListView displays loading state', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskListView(
            loading: true,
            tasks: const [],
            errorMessage: null,
            onRetry: () {},
            onToggle: (_) {},
            onDelete: (_) {},
          ),
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('TaskListView displays empty state', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskListView(
            loading: false,
            tasks: const [],
            errorMessage: null,
            onRetry: () {},
            onToggle: (_) {},
            onDelete: (_) {},
          ),
        ),
      ),
    );

    expect(find.text('No tasks yet. Add your first task.'), findsOneWidget);
  });

  testWidgets('TaskListView displays error state and retries', (tester) async {
    var retried = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskListView(
            loading: false,
            tasks: const [],
            errorMessage: 'Network error',
            onRetry: () {
              retried = true;
            },
            onToggle: (_) {},
            onDelete: (_) {},
          ),
        ),
      ),
    );

    expect(find.text('Network error'), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);

    await tester.tap(find.text('Retry'));
    expect(retried, isTrue);
  });

  testWidgets('TaskListView displays tasks and responds to toggle and delete',
      (tester) async {
    Task? toggledTask;
    Task? deletedTask;

    const task1 = Task(
      id: 'task-1',
      title: 'First Task',
      description: 'First Desc',
      completed: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskListView(
            loading: false,
            tasks: const [task1],
            errorMessage: null,
            onRetry: () {},
            onToggle: (t) => toggledTask = t,
            onDelete: (t) => deletedTask = t,
          ),
        ),
      ),
    );

    expect(find.text('First Task'), findsOneWidget);
    expect(find.text('First Desc'), findsOneWidget);

    // Toggle
    await tester.tap(find.byType(Checkbox));
    expect(toggledTask?.id, 'task-1');

    // Delete
    await tester.tap(find.byIcon(Icons.delete_outline));
    expect(deletedTask?.id, 'task-1');
  });
}
