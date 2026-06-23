import * as signalR from '@microsoft/signalr';
import type { TaskAssignedNotification } from '../types';

let connection: signalR.HubConnection | null = null;

export async function startConnection(token: string): Promise<void> {
  if (connection?.state === signalR.HubConnectionState.Connected) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL as string}/hubs/tasks`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  await connection.start();
}

export function onTaskAssigned(
  callback: (payload: TaskAssignedNotification) => void
): void {
  connection?.on('TaskAssigned', callback);
}

export function offTaskAssigned(): void {
  connection?.off('TaskAssigned');
}

export async function stopConnection(): Promise<void> {
  await connection?.stop();
  connection = null;
}
