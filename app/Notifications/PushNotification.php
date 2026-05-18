<?php

namespace App\Notifications;

use App\Models\PushNotification as PushNotificationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PushNotification extends Notification
{
    use Queueable;

    public function __construct(private PushNotificationModel $push) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => $this->push->title,
            'body'  => $this->push->body,
            'icon'  => $this->push->icon,
            'link'  => $this->push->link,
        ];
    }
}
