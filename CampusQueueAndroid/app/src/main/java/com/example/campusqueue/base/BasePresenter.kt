package com.example.campusqueue.base

/**
 * Base interface for all MVP Presenters.
 *
 * Every Presenter in the app must implement this interface.
 * The [onDestroy] method is called when the View (Activity) is destroyed,
 * allowing the Presenter to nullify the View reference and prevent memory leaks.
 */
interface BasePresenter {
    fun onDestroy()
}
