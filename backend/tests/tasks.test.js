'use strict';

const request = require('supertest');
const { app } = require('../src/app');

describe('tasks endpoints and authorization boundaries', () => {
  let userAToken;
  let userBToken;
  let userATaskId;

  beforeAll(async () => {
    const userA = await request(app).post('/api/v1/auth/register').send({
      email: `userA-${Date.now()}@example.test`,
      password: 'password123456',
    });
    userAToken = userA.body.accessToken;

    const userB = await request(app).post('/api/v1/auth/register').send({
      email: `userB-${Date.now()}@example.test`,
      password: 'password123456',
    });
    userBToken = userB.body.accessToken;
  });

  test('User A can create a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Task A', description: 'User A description' });

    expect(res.status).toBe(201);
    expect(res.body.item).toHaveProperty('id');
    expect(res.body.item.title).toBe('Task A');
    userATaskId = res.body.item.id;
  });

  test('User A can list their tasks', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });

  test('User B cannot see User A tasks in their list', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    const found = res.body.items.find((t) => t.id === userATaskId);
    expect(found).toBeUndefined();
  });

  test('User B cannot update User A task', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ completed: true });

    expect(res.status).toBe(404);
  });

  test('User B cannot delete User A task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  test('User A can update and delete their own task', async () => {
    const updateRes = await request(app)
      .patch(`/api/v1/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ completed: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.item.completed).toBe(true);

    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(deleteRes.status).toBe(204);
  });
});
